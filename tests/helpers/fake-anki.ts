import { expect } from 'vitest';
import { ANKI_ENDPOINT } from '../../src/lib/anki';

// An in-memory AnkiConnect that follows the documented API closely enough
// for the client: permissions, profiles, decks, the note type, and notes.
type Call = {
  action: string;
  version: number;
  params: Record<string, any>;
  key?: string;
};
type FakeNote = {
  noteId: number;
  modelName: string;
  fields: Record<string, { value: string; order: number }>;
  tags: string[];
};

export function fakeAnki() {
  const calls: Call[] = [];
  const notes = new Map<number, FakeNote>();
  const state = {
    profile: 'My learning profile',
    profiles: ['My learning profile'],
    decks: ['Default'],
    models: [] as string[],
    modelFields: ['Front', 'Back', 'Skill'],
    granted: true,
    requireApiKey: false,
    permissionKeyField: 'requireApikey' as 'requireApiKey' | 'requireApikey',
    apiVersion: 6,
    supportsActiveProfile: true,
    blockUpdates: false,
    nextNoteId: 1000,
    networkFailure: '',
    lostAddResponse: false,
  };
  const fetcher: typeof fetch = async (input, init) => {
    expect(input).toBe(ANKI_ENDPOINT);
    expect(init?.credentials).toBe('omit');
    expect(init?.redirect).toBe('error');
    expect(init?.headers).toEqual({
      'Content-Type': 'text/plain;charset=UTF-8',
    });
    const call: Call = JSON.parse(String(init?.body));
    calls.push(call);
    expect(call.version).toBe(6);
    if (state.networkFailure === call.action) {
      state.networkFailure = '';
      throw new TypeError('Network request failed');
    }
    let result: unknown = null;
    let error: string | null = null;
    switch (call.action) {
      case 'requestPermission':
        result = {
          permission: state.granted ? 'granted' : 'denied',
          [state.permissionKeyField]: state.requireApiKey,
          version: state.apiVersion,
        };
        break;
      case 'version':
        result = state.apiVersion;
        break;
      case 'getProfiles':
        result = [...state.profiles];
        break;
      case 'getActiveProfile':
        if (state.supportsActiveProfile) result = state.profile;
        else error = 'unsupported action';
        break;
      case 'deckNames':
        result = [...state.decks];
        break;
      case 'createDeck':
        if (!state.decks.includes(call.params.deck))
          state.decks.push(call.params.deck);
        result = 1;
        break;
      case 'modelNames':
        result = [...state.models];
        break;
      case 'createModel':
        state.models.push(call.params.modelName);
        result = { name: call.params.modelName };
        break;
      case 'modelFieldNames':
        result = [...state.modelFields];
        break;
      case 'findNotes':
        result = [...notes.values()]
          .filter((note) =>
            note.tags.includes(call.params.query.replace(/^tag:/, '')),
          )
          .map((note) => note.noteId);
        break;
      case 'addNote': {
        const note = call.params.note;
        if (
          [...notes.values()].some(
            (existing) => existing.fields.Front.value === note.fields.Front,
          ) &&
          !note.options.allowDuplicate
        ) {
          error = 'cannot create note because it is a duplicate';
          break;
        }
        result = state.nextNoteId++;
        notes.set(result as number, {
          noteId: result as number,
          modelName: note.modelName,
          fields: Object.fromEntries(
            Object.entries(note.fields).map(([name, value], order) => [
              name,
              { value: value as string, order },
            ]),
          ),
          tags: [...note.tags],
        });
        if (state.lostAddResponse) {
          state.lostAddResponse = false;
          throw new TypeError('Response lost after save');
        }
        break;
      }
      case 'notesInfo':
        result = call.params.notes.map((id: number) =>
          structuredClone(notes.get(id)),
        );
        break;
      case 'updateNoteFields': {
        if (!state.blockUpdates) {
          const note = notes.get(call.params.note.id)!;
          for (const [name, value] of Object.entries(call.params.note.fields))
            note.fields[name].value = value as string;
        }
        break;
      }
      case 'addTags':
        for (const id of call.params.notes)
          notes.get(id)!.tags.push(...call.params.tags.split(' '));
        break;
      case 'sync':
        break;
      default:
        error = `unsupported action: ${call.action}`;
    }
    return new Response(JSON.stringify({ result, error }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  return { calls, notes, state, fetcher };
}
