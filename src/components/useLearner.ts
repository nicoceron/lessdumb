import { useEffect, useRef, useState } from 'react';
import {
  AccountRequestError,
  authClient,
  loadAccountState,
  saveAccountState,
  StateConflictError,
  type AccountSessionState,
} from '../lib/account';
import {
  createState,
  mergeStates,
  missingMasteryCards,
  queueMasteryCards,
  type LearnerState,
} from '../lib/state';
import { loadSkills } from '../lib/content';
import {
  MAX_STATE_BODY_BYTES,
  parseStateUpdate,
} from '../lib/server/state-validation';

interface Snapshot {
  owner: string | null | undefined;
  value: LearnerState;
  revision: number | null;
  needsSave: boolean;
  hasDeviceState: boolean;
  guestMigrationRaw?: string;
  /**
   * A merge with account progress may have completed a skill's mastery whose
   * cards wait for that course's content to load.
   */
  mergedCards?: boolean;
}
export interface Learner {
  state: LearnerState;
  update: (fn: (state: LearnerState) => LearnerState) => void;
  ready: boolean;
  sync: string;
  session: AccountSessionState;
  retrySync: () => void;
}
function storageKey(owner: string | null): string {
  return owner ? `lessdumb.account.${owner}` : 'lessdumb.guest';
}
function readLocal(key: string): { state: LearnerState; raw: string } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw.length > MAX_STATE_BODY_BYTES) return null;
    if (new TextEncoder().encode(raw).byteLength > MAX_STATE_BODY_BYTES)
      return null;
    return {
      state: parseStateUpdate({ state: JSON.parse(raw), revision: 0 }).state,
      raw,
    };
  } catch {
    return null;
  }
}
function guestClaim(): { owner: string; raw: string } | null {
  try {
    const value = JSON.parse(
      localStorage.getItem('lessdumb.guest-import') ?? 'null',
    );
    return value &&
      typeof value.owner === 'string' &&
      typeof value.raw === 'string'
      ? value
      : null;
  } catch {
    return null;
  }
}

export function useLearner(): Learner {
  const session = authClient.useSession();
  const userId = session.data?.user.id ?? null;
  const [snapshot, setSnapshot] = useState<Snapshot>(() => ({
    owner: undefined,
    value: createState(),
    revision: null,
    needsSave: false,
    hasDeviceState: false,
  }));
  const [sync, setSync] = useState('Loading your learning space…');
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);
  const sessionOwner = useRef<string | null | undefined>(undefined);
  const latest = useRef(snapshot);
  const refetchSession = useRef(session.refetch);
  const saving = useRef<{
    controller: AbortController;
    generation: number;
  } | null>(null);
  latest.current = snapshot;
  sessionOwner.current = session.isPending ? undefined : userId;
  refetchSession.current = session.refetch;
  // Ownership is checked during render, before effects can write a previous account's state.
  const ready = !session.isPending && snapshot.owner === userId;

  useEffect(() => {
    const currentGeneration = ++generation.current;
    saving.current?.controller.abort();
    saving.current = null;
    if (session.isPending) return;
    const local = readLocal(storageKey(userId));
    const claim = userId ? guestClaim() : null;
    setSnapshot({
      owner: userId,
      value: local?.state ?? createState(),
      revision: null,
      needsSave: false,
      hasDeviceState: !!local,
      guestMigrationRaw: claim?.owner === userId ? claim.raw : undefined,
    });
    setSync(userId ? 'Loading account progress…' : 'Saved on this device');
    return () => {
      if (generation.current === currentGeneration)
        saving.current?.controller.abort();
    };
  }, [userId, session.isPending]);

  useEffect(() => {
    if (!ready || !userId || snapshot.revision !== null) return;
    const controller = new AbortController();
    const currentGeneration = generation.current;
    setSync('Loading account progress…');
    loadAccountState(userId, controller.signal)
      .then((result) => {
        if (
          controller.signal.aborted ||
          generation.current !== currentGeneration ||
          sessionOwner.current !== userId
        )
          return;
        const claim = guestClaim();
        const guest =
          result.state || (claim && claim.owner !== userId)
            ? null
            : readLocal('lessdumb.guest');
        setSnapshot((current) => {
          if (current.owner !== userId) return current;
          const hasLocalProgress = current.hasDeviceState || current.needsSave;
          const merged = !!result.state && hasLocalProgress;
          const value = result.state
            ? hasLocalProgress
              ? mergeStates(current.value, result.state)
              : result.state
            : hasLocalProgress
              ? current.value
              : (guest?.state ?? current.value);
          return {
            ...current,
            value,
            revision: result.revision,
            needsSave: true,
            hasDeviceState: true,
            guestMigrationRaw:
              !result.state && !hasLocalProgress
                ? guest?.raw
                : current.guestMigrationRaw,
            mergedCards: merged || current.mergedCards,
          };
        });
        setSync('Account connected');
      })
      .catch((error) => {
        if (
          controller.signal.aborted ||
          generation.current !== currentGeneration ||
          sessionOwner.current !== userId
        )
          return;
        if (error instanceof AccountRequestError && error.status === 401)
          refetchSession.current();
        setSync('Account unavailable · progress saved on this device');
      });
    return () => controller.abort();
  }, [ready, userId, snapshot.owner, snapshot.revision, retry]);

  useEffect(() => {
    if (!ready || snapshot.owner === undefined) return;
    // A blank loading placeholder must not become a newer local copy of an existing account.
    if (
      snapshot.owner &&
      snapshot.revision === null &&
      !snapshot.hasDeviceState &&
      !snapshot.needsSave
    )
      return;
    try {
      localStorage.setItem(
        storageKey(snapshot.owner),
        JSON.stringify(snapshot.value),
      );
      if (snapshot.owner && snapshot.guestMigrationRaw) {
        localStorage.setItem(
          'lessdumb.guest-import',
          JSON.stringify({
            owner: snapshot.owner,
            raw: snapshot.guestMigrationRaw,
          }),
        );
      }
    } catch {
      setSync('Device storage is full · export a backup');
    }
  }, [
    ready,
    snapshot.owner,
    snapshot.value,
    snapshot.revision,
    snapshot.hasDeviceState,
    snapshot.needsSave,
    snapshot.guestMigrationRaw,
  ]);

  useEffect(() => {
    if (!ready || !userId || snapshot.revision === null || !snapshot.needsSave)
      return;
    const currentGeneration = generation.current;
    const timer = setTimeout(async () => {
      if (
        sessionOwner.current !== userId ||
        generation.current !== currentGeneration ||
        saving.current
      )
        return;
      const current = latest.current;
      if (
        current.owner !== userId ||
        current.revision === null ||
        !current.needsSave
      )
        return;
      const request = {
        controller: new AbortController(),
        generation: currentGeneration,
      };
      saving.current = request;
      const submitted = current.value;
      setSync('Saving progress…');
      try {
        const result = await saveAccountState(
          submitted,
          current.revision,
          userId,
          request.controller.signal,
        );
        if (
          request.controller.signal.aborted ||
          generation.current !== currentGeneration ||
          sessionOwner.current !== userId
        )
          return;
        setSnapshot((value) =>
          value.owner !== userId
            ? value
            : {
                ...value,
                revision: result.revision,
                needsSave: value.value !== submitted,
                guestMigrationRaw: undefined,
              },
        );
        // Remove only the exact guest snapshot after the account write is durable.
        if (current.guestMigrationRaw) {
          try {
            if (
              localStorage.getItem('lessdumb.guest') ===
              current.guestMigrationRaw
            )
              localStorage.removeItem('lessdumb.guest');
            const claim = guestClaim();
            if (
              claim?.owner === userId &&
              claim.raw === current.guestMigrationRaw
            )
              localStorage.removeItem('lessdumb.guest-import');
          } catch {
            /* Account copy is already durable. */
          }
        }
        setSync(
          latest.current.value === submitted
            ? 'All progress saved'
            : 'Saving latest progress…',
        );
      } catch (error) {
        if (
          request.controller.signal.aborted ||
          generation.current !== currentGeneration ||
          sessionOwner.current !== userId
        )
          return;
        if (error instanceof StateConflictError) {
          setSnapshot((value) =>
            value.owner !== userId
              ? value
              : {
                  ...value,
                  value: error.latest.state
                    ? mergeStates(value.value, error.latest.state)
                    : value.value,
                  revision: error.latest.revision,
                  needsSave: true,
                  mergedCards: !!error.latest.state || value.mergedCards,
                },
          );
          setSync('Combining progress from your devices…');
        } else {
          if (error instanceof AccountRequestError && error.status === 401) {
            setSnapshot((value) =>
              value.owner !== userId ? value : { ...value, revision: null },
            );
            refetchSession.current();
          }
          setSync('Account sync unavailable · saved on this device');
        }
      } finally {
        if (saving.current === request) saving.current = null;
        if (
          generation.current === currentGeneration &&
          sessionOwner.current === userId &&
          latest.current.value !== submitted
        )
          setRetry((value) => value + 1);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [
    ready,
    userId,
    snapshot.value,
    snapshot.revision,
    snapshot.needsSave,
    retry,
  ]);

  // Merging can complete a skill's mastery, which earns its cards. Card text
  // is lesson content: load the courses it belongs to, then queue the cards.
  useEffect(() => {
    if (!ready || !snapshot.mergedCards) return;
    const owner = snapshot.owner;
    const settle = () =>
      setSnapshot((value) =>
        value.owner === owner ? { ...value, mergedCards: false } : value,
      );
    const missing = missingMasteryCards(latest.current.value);
    if (!missing.length) {
      settle();
      return;
    }
    let current = true;
    loadSkills(missing).then(
      () => {
        if (!current) return;
        settle();
        update((state) => queueMasteryCards(state));
      },
      // Offline: the next merge tries again.
      () => {},
    );
    return () => {
      current = false;
    };
  }, [ready, snapshot.owner, snapshot.mergedCards]);

  function retrySync() {
    setSnapshot((value) => ({ ...value, revision: null }));
    setRetry((value) => value + 1);
  }
  useEffect(() => {
    const online = () => {
      setSnapshot((value) => ({ ...value, revision: null }));
      setRetry((value) => value + 1);
    };
    window.addEventListener('online', online);
    return () => window.removeEventListener('online', online);
  }, []);
  function update(fn: (state: LearnerState) => LearnerState) {
    const owner = userId;
    setSnapshot((value) =>
      value.owner !== owner || sessionOwner.current !== owner
        ? value
        : {
            ...value,
            value: { ...fn(value.value), updatedAt: Date.now() },
            needsSave: true,
          },
    );
  }
  return { state: snapshot.value, update, ready, sync, session, retrySync };
}
