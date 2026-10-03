import type { AccountSessionState } from './account';

/**
 * Who owns the learning space: a user id, `null` for a guest, or `undefined`
 * while no session lookup has settled it.
 */
export type SessionOwner = string | null | undefined;

/**
 * Resolves the owner from the latest session state and the owner it resolved to before.
 *
 * Better Auth marks every session lookup that starts without session data as pending
 * (`isPending: data === null`). That is right for the first lookup, but a guest's data is
 * always `null`, so each focus, reconnect or cross-tab refetch also reported a guest as
 * pending, and the workspace unmounted until the lookup returned (CEN-172).
 *
 * A confirmed guest therefore stays a guest while a later lookup is in flight, as Better Auth
 * keeps an account's data while it refetches. The lookup's result still decides ownership:
 * a user id is a new owner and goes through `useLearner`'s ownership checks, and a failed
 * lookup leaves the owner unresolved (the retry screen), because a failure confirms no one.
 * Before any lookup has settled, or after a failed one, a lookup in flight stays unresolved.
 */
export function resolveSessionOwner(
  previous: SessionOwner,
  session: Pick<AccountSessionState, 'data' | 'isPending' | 'error'>,
): SessionOwner {
  if (!session.isPending) return session.data?.user.id ?? null;
  return previous === null && !session.data && !session.error
    ? null
    : undefined;
}
