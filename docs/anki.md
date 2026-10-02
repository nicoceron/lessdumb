# Connect lessdumb to your Anki account

lessdumb creates cards in **Anki desktop**, in the profile you explicitly connect. Anki then synchronizes that profile with your **AnkiWeb account**. It does not ask for your AnkiWeb password or claim that a desktop connection proves you are signed into AnkiWeb.

## Setup

1. Install the free [Anki desktop application](https://apps.ankiweb.net/).
2. Open the profile you want to use. In Anki, choose **Tools → Add-ons → Get Add-ons**, enter **2055492159**, and restart Anki. This installs [AnkiConnect](https://ankiweb.net/shared/info/2055492159).
3. In Anki, use **Sync** to sign into your free [AnkiWeb account](https://ankiweb.net/). Follow Anki's instructions carefully if your first sync asks whether to upload or download an existing collection. See the [Anki sync manual](https://docs.ankiweb.net/syncing.html).
4. Leave Anki open. In lessdumb, click **Connect Anki**. If Anki displays a permission dialog, allow the website. Trusted local origins such as `http://127.0.0.1:4321` may already be permitted by AnkiConnect and connect without another dialog. Allow local-network access in your browser if requested.
5. Check the **connected profile name** displayed in lessdumb. New cards are sent to **lessdumb::Learning**. Keep Anki open while studying so automatic card creation can run.

If your AnkiConnect configuration enables an `apiKey`, enter that **add-on API key** when connecting. It is different from an AnkiWeb password. Never put either secret in source code.

Only one desktop profile should sync to a given AnkiWeb account. See the [Anki profiles manual](https://docs.ankiweb.net/profiles.html).

## What gets created

The application queues concise recall cards when skills are mastered and correction cards after mistakes. A card has a stable identity derived from its skill or exercise, so retrying the queue updates an existing note instead of creating another one.

The **lessdumb** note type has `Front`, `Back`, and `Skill` fields, with one recall card template. The client escapes plain text and Python examples before inserting them into Anki HTML. It adds a `lessdumb` tag, an encoded identity tag, an encoded skill tag, and a mastery or mistake tag. Updating fields preserves the note ID, Anki review scheduling, and any tags you add yourself.

The browser uses AnkiConnect's documented JSON API at `http://127.0.0.1:8765`; requests stay on your computer. The first request is `requestPermission`, which returns immediately for trusted origins and can prompt in Anki for other origins. The client then checks API version 6, the active profile, and available decks. It never automatically switches profiles. If the profile changes after connection, sending stops until you reconnect. Older AnkiConnect versions without `getActiveProfile` are supported only when they have exactly one profile, with the connection marked as inferred.

Cards remain in the application's queue when Anki is closed, a permission is missing, or creation fails. Retry after fixing the reported issue. If a network response is lost after Anki saves a card, the next retry finds that saved note by its stable tag.

Saving a note locally is separate from uploading it to AnkiWeb. Use **Sync** in Anki. Anki also supports automatic sync when opening or closing a profile. lessdumb uses the supported desktop add-on rather than an undocumented web-login or account API.

For manual import, **Export for Anki** downloads a UTF-8 TSV with Anki's separator, HTML, column, and tags-column headers. The Front and Back fields preserve Python indentation and line breaks, convert tabs to four spaces, and escape literal HTML characters. Import the file through **File → Import** in Anki and map Front, Back, and Tags as shown in the preview. The export includes stable lessdumb identity tags. See Anki's [text-file import documentation](https://docs.ankiweb.net/importing/text-files.html).

## Troubleshooting

- **Cannot reach Anki:** confirm desktop Anki is running, the AnkiConnect add-on is enabled, and no dialog is blocking Anki. Open `http://127.0.0.1:8765` locally to check the service.
- **Permission denied:** connect again and approve the actual website origin in Anki. If you previously told Anki to ignore that origin, remove it from AnkiConnect's `ignoreOriginList`. Do not allow every origin with `*`.
- **The browser blocks access:** permit local-network access for the website. Keep the integration loopback-only; do not expose port 8765 to the internet.
- **API key required:** use the `apiKey` configured in AnkiConnect's add-on settings.
- **Unknown active profile:** open your collection in Anki and update AnkiConnect. The client refuses to guess among multiple profiles.
- **An update does not take effect:** close the note editor in Anki and retry. AnkiConnect documents that viewing a note while updating it can prevent a field update; lessdumb verifies updates before removing cards from the queue.
- **Note-type conflict:** an existing type named `lessdumb` must contain `Front`, `Back`, and `Skill`. Rename the conflicting type or restore these fields in Anki; lessdumb does not overwrite unrelated note types.
- **Duplicate note warning:** review the conflicting note in Anki before retrying. lessdumb does not delete existing notes automatically.

## Developer API

```ts
import { createAnkiClient, type AnkiCard } from '../lib/anki';

const client = createAnkiClient();
// Run only after the user clicks Connect Anki.
const connection = await client.connect();
console.log(connection.activeProfile);

const cards: AnkiCard[] = [
  {
    id: 'mastery:python-variables',
    skillId: 'python-variables',
    skillName: 'Variables',
    kind: 'mastery',
    front: 'What does score = 10 do?',
    back: 'It binds the name score to the integer 10.',
  },
];
const result = await client.syncCards(cards, { deck: 'lessdumb::Learning' });
// Remove result.synced card IDs from the durable queue.
// Keep result.failed cards and display their error/retryable fields.
```

The client serializes queue flushes, returns separate confirmed and failed results, and checks profile identity before each note. `disconnect()` stops new flushes; `getConnection()` returns a copy of the current connection; `syncToAnkiWeb()` invokes Anki's documented `sync` action.

Reference: [AnkiConnect maintained API documentation](https://github.com/ankiultimate/anki-connect#supported-actions), including `requestPermission`, `getActiveProfile`, `getProfiles`, `createModel`, `findNotes`, `addNote`, `notesInfo`, `updateNoteFields`, and `sync`.
