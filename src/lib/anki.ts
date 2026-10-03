import { cardBlocks, type CardBlock } from './card-text';
import { parseMathText } from './math-text';

/**
 * Browser-only AnkiConnect client. The application owns the durable card queue.
 * API reference: https://github.com/ankiultimate/anki-connect#supported-actions
 */
export const ANKI_ENDPOINT = 'http://127.0.0.1:8765';
export const ANKI_DECK = 'lessdumb::Learning';
export const ANKI_MODEL = 'lessdumb';
const API_VERSION = 6;
const MODEL_FIELDS = ['Front', 'Back', 'Skill'];

export interface AnkiCard {
  /** Stable identity, e.g. `mastery:variables` or `mistake:exercise-17`. */
  id: string;
  skillId: string;
  skillName: string;
  /**
   * Plain text, shown as written, unless `format` says otherwise. HTML is
   * escaped before it is sent to Anki.
   */
  front: string;
  back: string;
  /**
   * `'prose'`: `front` and `back` are authored lesson prose (`$…$` math,
   * backtick code spans, `\$` for a dollar) with code in fenced blocks, as
   * mistake cards made since CEN-128 are (`src/lib/card-text.ts`). Absent:
   * plain text, as mastery cards and older mistake cards are.
   */
  format?: 'prose';
  kind: 'mastery' | 'mistake';
}

export interface AnkiConnection {
  version: number;
  activeProfile: string;
  /** False only for old add-ons with exactly one profile and no active-profile API. */
  profileVerified: boolean;
  profileNames: string[];
  deckNames: string[];
  requireApiKey: boolean;
}

export interface AnkiSyncedCard {
  cardId: string;
  noteId: number;
  status: 'created' | 'updated' | 'unchanged';
}

export interface AnkiFailedCard {
  cardId: string;
  error: string;
  code: AnkiErrorCode;
  retryable: boolean;
}

export interface AnkiSyncResult {
  synced: AnkiSyncedCard[];
  failed: AnkiFailedCard[];
}

export type AnkiErrorCode =
  | 'NOT_CONNECTED'
  | 'UNREACHABLE'
  | 'TIMEOUT'
  | 'PERMISSION_DENIED'
  | 'API_KEY_REQUIRED'
  | 'UNSUPPORTED_VERSION'
  | 'INVALID_RESPONSE'
  | 'ACTION_FAILED'
  | 'PROFILE_CHANGED'
  | 'PROFILE_UNKNOWN'
  | 'MODEL_CONFLICT'
  | 'INVALID_CARD';

export class AnkiConnectError extends Error {
  constructor(
    public readonly code: AnkiErrorCode,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'AnkiConnectError';
  }
}

export interface AnkiClientOptions {
  /** Only the AnkiConnect API key, if the add-on requires one. Never an AnkiWeb password. */
  apiKey?: string;
  deck?: string;
  /** Dependency injection for integration tests; production always uses loopback. */
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  permissionTimeoutMs?: number;
}

interface PermissionResult {
  permission: 'granted' | 'denied';
  /** README spelling, retained for compatible implementations. */
  requireApiKey?: boolean;
  /** The maintained add-on's actual response uses a lowercase k. */
  requireApikey?: boolean;
  version?: number;
}

interface NoteInfo {
  noteId: number;
  modelName: string;
  fields: Record<string, { value: string; order: number }>;
  tags: string[];
}

type NoteFields = { Front: string; Back: string; Skill: string };

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  );
}

const lineBreaks = (html: string) =>
  html.replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');

function textField(value: string): string {
  return `<div class="lessdumb-text">${lineBreaks(escapeHtml(value))}</div>`;
}

/**
 * Authored prose as Anki HTML. Anki typesets math with MathJax, which
 * recognizes `\(…\)` and `\[…\]` but not dollars, so `$…$` and `$$…$$` become
 * those delimiters. `\$` is a plain dollar sign, which MathJax leaves alone.
 * Code spans become `<code>`, which MathJax skips, so code is never typeset.
 */
export function ankiProseHtml(text: string): string {
  return lineBreaks(
    parseMathText(text)
      .segments.map((segment) => {
        if (segment.kind === 'code')
          return `<code>${escapeHtml(segment.text)}</code>`;
        if (segment.kind === 'text') return escapeHtml(segment.text);
        // TeX treats a line break as a space; keep the math on one line.
        const tex = escapeHtml(segment.tex.replace(/\s*\r?\n\s*/g, ' '));
        return segment.display ? `\\[${tex}\\]` : `\\(${tex}\\)`;
      })
      .join(''),
  );
}

/**
 * Card blocks as Anki HTML. Prose goes in a `<div>`: MathJax skips `<pre>`
 * and `<code>`, so math inside them would stay raw TeX. Code goes in a
 * `<pre>` for that reason. Inline styles keep whitespace in any note type,
 * including the Basic type a TSV import may use.
 */
function blocksField(blocks: CardBlock[], tabs?: boolean): string {
  const text = (value: string) => (tabs ? value.replace(/\t/g, '    ') : value);
  return blocks
    .filter((block) => block.text.trim())
    .map((block) =>
      block.kind === 'code'
        ? `<pre style="white-space:pre-wrap">${lineBreaks(escapeHtml(text(block.text)))}</pre>`
        : `<div class="lessdumb-text" style="white-space:pre-wrap">${ankiProseHtml(text(block.text))}</div>`,
    )
    .join('');
}

/** An injective encoding makes arbitrary IDs safe in Anki tags and searches. */
function tagId(value: string): string {
  return Array.from(new TextEncoder().encode(value), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export function ankiCardTag(id: string): string {
  return `lessdumb_card_${tagId(id)}`;
}

function cardFields(card: AnkiCard): NoteFields {
  return {
    Front: card.format
      ? blocksField(cardBlocks(card.front))
      : textField(card.front),
    Back: card.format
      ? blocksField(cardBlocks(card.back))
      : textField(card.back),
    Skill: escapeHtml(card.skillName),
  };
}

function cardTags(card: AnkiCard): string[] {
  return [
    'lessdumb',
    ankiCardTag(card.id),
    `lessdumb_skill_${tagId(card.skillId)}`,
    `lessdumb_${card.kind}`,
  ];
}

/**
 * Anki's documented UTF-8 text import format, preserving Python whitespace.
 * Plain-text cards keep one `<pre>`; `format: 'prose'` cards use the
 * AnkiConnect layout, so their math is typeset too.
 */
export function exportCardsTsv(cards: readonly AnkiCard[]): string {
  const plain = (text: string) =>
    `<pre style="white-space:pre-wrap">${lineBreaks(escapeHtml(text.replace(/\t/g, '    ')))}</pre>`;
  const side = (card: AnkiCard, name: 'front' | 'back') =>
    card.format ? blocksField(cardBlocks(card[name]), true) : plain(card[name]);
  const headers = [
    '#separator:Tab',
    '#html:true',
    '#columns:Front\tBack\tTags',
    '#tags column:3',
  ];
  const rows = cards.map((card) =>
    [side(card, 'front'), side(card, 'back'), cardTags(card).join(' ')].join(
      '\t',
    ),
  );
  return [...headers, ...rows].join('\n') + '\n';
}

function requireStrings(value: unknown, action: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new AnkiConnectError(
      'INVALID_RESPONSE',
      `AnkiConnect returned an invalid ${action} response. Update the add-on and reconnect.`,
    );
  }
  return value;
}

function requireNoteIds(value: unknown): number[] {
  if (
    !Array.isArray(value) ||
    value.some((id) => !Number.isSafeInteger(id) || id <= 0)
  ) {
    throw new AnkiConnectError(
      'INVALID_RESPONSE',
      'AnkiConnect returned invalid note IDs. Reconnect before retrying.',
    );
  }
  return value;
}

function asAnkiError(error: unknown): AnkiConnectError {
  return error instanceof AnkiConnectError
    ? error
    : new AnkiConnectError(
        'UNREACHABLE',
        'Could not reach Anki. Keep Anki desktop open with AnkiConnect installed, then retry.',
        true,
      );
}

/**
 * Call connect() from the explicit Connect Anki button. Subsequent syncCards()
 * calls can run automatically while that connection is active.
 */
export class AnkiClient {
  private connection: AnkiConnection | null = null;
  private readonly fetcher: typeof globalThis.fetch;
  private readonly apiKey?: string;
  private readonly deck: string;
  private readonly timeoutMs: number;
  private readonly permissionTimeoutMs: number;
  private syncTail: Promise<void> = Promise.resolve();
  private generation = 0;

  constructor(options: AnkiClientOptions = {}) {
    this.fetcher = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.apiKey = options.apiKey?.trim() || undefined;
    this.deck = options.deck?.trim() || ANKI_DECK;
    this.timeoutMs = options.timeoutMs ?? 10_000;
    // Anki may be waiting for the user to answer its own permission dialog.
    this.permissionTimeoutMs = options.permissionTimeoutMs ?? 120_000;
  }

  getConnection(): AnkiConnection | null {
    return this.connection
      ? {
          ...this.connection,
          profileNames: [...this.connection.profileNames],
          deckNames: [...this.connection.deckNames],
        }
      : null;
  }

  disconnect(): void {
    this.connection = null;
    this.generation += 1;
  }

  private async invoke<T>(
    action: string,
    params: Record<string, unknown> = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      action === 'requestPermission'
        ? this.permissionTimeoutMs
        : this.timeoutMs,
    );
    try {
      const response = await this.fetcher(ANKI_ENDPOINT, {
        method: 'POST',
        // A simple request lets requestPermission reach Anki before its origin
        // has been approved. AnkiConnect parses the body as JSON itself.
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({
          action,
          version: API_VERSION,
          params,
          ...(action !== 'requestPermission' && this.apiKey
            ? { key: this.apiKey }
            : {}),
        }),
        signal: controller.signal,
        credentials: 'omit',
        mode: 'cors',
        redirect: 'error',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new AnkiConnectError(
          response.status === 403 ? 'PERMISSION_DENIED' : 'UNREACHABLE',
          response.status === 403
            ? 'Anki has not allowed this website. Connect again and allow access in Anki.'
            : `AnkiConnect returned HTTP ${response.status}. Keep Anki open and retry.`,
          response.status !== 403,
        );
      }
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new AnkiConnectError(
          'INVALID_RESPONSE',
          'AnkiConnect did not return JSON. Check that the AnkiConnect add-on is installed.',
        );
      }
      if (
        payload === null ||
        typeof payload !== 'object' ||
        !('result' in payload) ||
        !('error' in payload)
      ) {
        throw new AnkiConnectError(
          'INVALID_RESPONSE',
          'AnkiConnect returned an invalid response. Update the add-on and reconnect.',
        );
      }
      const reply = payload as { result: T; error: unknown };
      if (reply.error !== null) {
        const detail =
          typeof reply.error === 'string'
            ? reply.error
            : 'Unknown AnkiConnect error';
        const retryable =
          /busy|locked|not available|temporar|editor|viewing/i.test(detail);
        throw new AnkiConnectError(
          'ACTION_FAILED',
          `${action}: ${detail}`,
          retryable,
        );
      }
      return reply.result;
    } catch (error) {
      if (controller.signal.aborted) {
        throw new AnkiConnectError(
          'TIMEOUT',
          'Anki did not respond in time. Check for an open Anki dialog, then retry.',
          true,
        );
      }
      throw asAnkiError(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  async connect(): Promise<AnkiConnection> {
    this.disconnect();
    const generation = this.generation;
    const permission = await this.invoke<PermissionResult>('requestPermission');
    if (!permission || permission.permission !== 'granted') {
      throw new AnkiConnectError(
        'PERMISSION_DENIED',
        'Allow lessdumb in the Anki permission dialog, then connect again.',
      );
    }
    // Accept the documentation spelling and the deployed add-on's spelling.
    // If both are supplied, honor either requiring a key.
    const requireApiKey =
      permission.requireApiKey === true || permission.requireApikey === true;
    if (requireApiKey && !this.apiKey) {
      throw new AnkiConnectError(
        'API_KEY_REQUIRED',
        'This AnkiConnect installation requires an API key. Enter its configured API key and reconnect.',
      );
    }
    const version = await this.invoke<number>('version');
    if (!Number.isInteger(version) || version < API_VERSION) {
      throw new AnkiConnectError(
        'UNSUPPORTED_VERSION',
        'lessdumb requires AnkiConnect API version 6. Update the add-on and reconnect.',
      );
    }
    const profileNames = requireStrings(
      await this.invoke('getProfiles'),
      'getProfiles',
    );
    const profile = await this.readActiveProfile(profileNames);
    const deckNames = requireStrings(
      await this.invoke('deckNames'),
      'deckNames',
    );
    if (generation !== this.generation) {
      throw new AnkiConnectError(
        'NOT_CONNECTED',
        'The Anki connection was canceled. Connect again to send cards.',
      );
    }
    this.connection = {
      version,
      activeProfile: profile.name,
      profileVerified: profile.verified,
      profileNames,
      deckNames,
      requireApiKey,
    };
    return this.getConnection()!;
  }

  private async readActiveProfile(
    profiles?: string[],
  ): Promise<{ name: string; verified: boolean }> {
    try {
      const name = await this.invoke<unknown>('getActiveProfile');
      if (typeof name !== 'string' || !name.trim()) {
        throw new AnkiConnectError(
          'PROFILE_UNKNOWN',
          'Open your Anki profile before connecting lessdumb.',
        );
      }
      return { name, verified: true };
    } catch (error) {
      if (
        !(error instanceof AnkiConnectError) ||
        error.code !== 'ACTION_FAILED' ||
        !/unsupported action/i.test(error.message)
      )
        throw error;
      const names =
        profiles ??
        requireStrings(await this.invoke('getProfiles'), 'getProfiles');
      if (names.length !== 1) {
        throw new AnkiConnectError(
          'PROFILE_UNKNOWN',
          'Update AnkiConnect so lessdumb can verify your active profile. Your current add-on has multiple profiles but cannot identify the open one.',
        );
      }
      return { name: names[0], verified: false };
    }
  }

  private async assertProfile(generation: number): Promise<void> {
    if (!this.connection || generation !== this.generation) {
      throw new AnkiConnectError(
        'NOT_CONNECTED',
        'Connect Anki before sending cards.',
      );
    }
    const activeProfile = await this.readActiveProfile();
    if (generation !== this.generation || !this.connection) {
      throw new AnkiConnectError(
        'NOT_CONNECTED',
        'The Anki connection was canceled. Connect again to send cards.',
      );
    }
    if (activeProfile.name !== this.connection.activeProfile) {
      this.disconnect();
      throw new AnkiConnectError(
        'PROFILE_CHANGED',
        `Anki switched to “${activeProfile.name}”. Reconnect to choose that profile before sending cards.`,
      );
    }
  }

  private async ensureDestination(deck: string): Promise<void> {
    if (!deck || deck.length > 200 || /[\r\n]/.test(deck)) {
      throw new AnkiConnectError(
        'INVALID_CARD',
        'Choose a valid Anki deck name.',
      );
    }
    await this.invoke('createDeck', { deck }); // Documented to preserve existing decks.
    const modelNames = requireStrings(
      await this.invoke('modelNames'),
      'modelNames',
    );
    if (!modelNames.includes(ANKI_MODEL)) {
      await this.invoke('createModel', {
        modelName: ANKI_MODEL,
        inOrderFields: MODEL_FIELDS,
        css: '.card{font-family:system-ui,sans-serif;font-size:20px;text-align:left;line-height:1.55;color:#e9ece6;background:#121712;padding:24px;max-width:720px;margin:auto}.skill{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9aad91;margin-bottom:18px}.lessdumb-text{white-space:pre-wrap;overflow-wrap:anywhere}hr{border:0;border-top:1px solid #3b4938;margin:24px 0}',
        isCloze: false,
        cardTemplates: [
          {
            Name: 'Recall',
            Front: '<div class="skill">{{Skill}}</div>{{Front}}',
            Back: '{{FrontSide}}<hr id="answer">{{Back}}',
          },
        ],
      });
    }
    const fields = requireStrings(
      await this.invoke('modelFieldNames', { modelName: ANKI_MODEL }),
      'modelFieldNames',
    );
    if (MODEL_FIELDS.some((field) => !fields.includes(field))) {
      throw new AnkiConnectError(
        'MODEL_CONFLICT',
        'The existing “lessdumb” note type needs Front, Back, and Skill fields. Rename the existing type or restore those fields in Anki, then retry.',
      );
    }
  }

  private validateCard(card: AnkiCard): void {
    if (
      !card ||
      [card.id, card.skillId, card.skillName, card.front, card.back].some(
        (value) => typeof value !== 'string' || !value.trim(),
      ) ||
      !['mastery', 'mistake'].includes(card.kind)
    ) {
      throw new AnkiConnectError(
        'INVALID_CARD',
        'A generated card is missing its identity, question, answer, or skill.',
      );
    }
  }

  private async readNote(noteId: number): Promise<NoteInfo> {
    const notes = await this.invoke<NoteInfo[]>('notesInfo', {
      notes: [noteId],
    });
    const note = Array.isArray(notes) ? notes[0] : undefined;
    if (
      !note ||
      note.noteId !== noteId ||
      note.modelName !== ANKI_MODEL ||
      !note.fields ||
      MODEL_FIELDS.some(
        (field) => typeof note.fields[field]?.value !== 'string',
      ) ||
      !Array.isArray(note.tags)
    ) {
      throw new AnkiConnectError(
        'MODEL_CONFLICT',
        'A matching lessdumb card uses an incompatible note type. Check it in Anki before retrying.',
      );
    }
    return note;
  }

  private async upsertCard(
    card: AnkiCard,
    deck: string,
  ): Promise<AnkiSyncedCard> {
    this.validateCard(card);
    const fields = cardFields(card);
    const tags = cardTags(card);
    const matches = requireNoteIds(
      await this.invoke('findNotes', { query: `tag:${ankiCardTag(card.id)}` }),
    );
    if (matches.length > 1) {
      throw new AnkiConnectError(
        'ACTION_FAILED',
        'This card has multiple matching Anki notes. Remove the duplicate in Anki before retrying.',
      );
    }
    if (matches.length === 1) {
      const noteId = matches[0];
      const note = await this.readNote(noteId);
      const changed = MODEL_FIELDS.some(
        (field) =>
          note.fields[field].value !== fields[field as keyof NoteFields],
      );
      if (changed) {
        await this.invoke('updateNoteFields', { note: { id: noteId, fields } });
        // AnkiConnect documents that an open note editor can prevent updates.
        const updated = await this.readNote(noteId);
        if (
          MODEL_FIELDS.some(
            (field) =>
              updated.fields[field].value !== fields[field as keyof NoteFields],
          )
        ) {
          throw new AnkiConnectError(
            'ACTION_FAILED',
            'Close the card editor in Anki, then retry updating this card.',
            true,
          );
        }
      }
      const missingTags = tags.filter((tag) => !note.tags.includes(tag));
      if (missingTags.length)
        await this.invoke('addTags', {
          notes: [noteId],
          tags: missingTags.join(' '),
        });
      return {
        cardId: card.id,
        noteId,
        status: changed || missingTags.length ? 'updated' : 'unchanged',
      };
    }
    const noteId = await this.invoke<unknown>('addNote', {
      note: {
        deckName: deck,
        modelName: ANKI_MODEL,
        fields,
        tags,
        options: { allowDuplicate: false, duplicateScope: 'collection' },
      },
    });
    if (
      typeof noteId !== 'number' ||
      !Number.isSafeInteger(noteId) ||
      noteId <= 0
    ) {
      throw new AnkiConnectError(
        'ACTION_FAILED',
        'Anki did not confirm card creation. Retry to check whether the card was saved.',
        true,
      );
    }
    return { cardId: card.id, noteId, status: 'created' };
  }

  /** Only remove result.synced cards from the persisted queue; retain failures. */
  syncCards(
    cards: readonly AnkiCard[],
    options: { deck?: string } = {},
  ): Promise<AnkiSyncResult> {
    const generation = this.generation;
    // Serializing flushes within this client prevents concurrent duplicate adds.
    const operation = this.syncTail.then(() =>
      this.flushCards(cards, options.deck?.trim() || this.deck, generation),
    );
    this.syncTail = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  private async flushCards(
    cards: readonly AnkiCard[],
    deck: string,
    generation: number,
  ): Promise<AnkiSyncResult> {
    const result: AnkiSyncResult = { synced: [], failed: [] };
    if (!cards.length) return result;
    const failure = (card: AnkiCard, error: unknown): AnkiFailedCard => {
      const cause = asAnkiError(error);
      return {
        cardId: card.id,
        error: cause.message,
        code: cause.code,
        retryable: cause.retryable,
      };
    };
    try {
      await this.assertProfile(generation);
      await this.ensureDestination(deck);
    } catch (error) {
      result.failed = cards.map((card) => failure(card, error));
      return result;
    }
    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      try {
        // Do not silently write a queued card into a different desktop profile.
        await this.assertProfile(generation);
        result.synced.push(await this.upsertCard(card, deck));
      } catch (error) {
        result.failed.push(failure(card, error));
        const cause = asAnkiError(error);
        if (
          [
            'UNREACHABLE',
            'TIMEOUT',
            'NOT_CONNECTED',
            'PROFILE_CHANGED',
            'PROFILE_UNKNOWN',
            'PERMISSION_DENIED',
          ].includes(cause.code)
        ) {
          result.failed.push(
            ...cards
              .slice(index + 1)
              .map((remaining) => failure(remaining, error)),
          );
          break;
        }
      }
    }
    return result;
  }

  /** Anki performs its own account sync and displays any first-sync decisions. */
  async syncToAnkiWeb(): Promise<void> {
    await this.assertProfile(this.generation);
    await this.invoke('sync');
  }
}

export function createAnkiClient(options: AnkiClientOptions = {}): AnkiClient {
  return new AnkiClient(options);
}
