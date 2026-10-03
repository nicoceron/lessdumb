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

### Cards in learner state

Since state version 8 (CEN-153), a queued card is a reference, not a copy of lesson text: its ID, skill, kind, and sync status, plus, for a mistake on a generated question, the variant number that was missed. A mistake card's ID names its question (`mistake:<skill>:<question>`); a mastery card's ID is the authored flashcard's. The text comes from the catalog when it is needed (`src/lib/cards.ts`): the Flashcards page downloads the units of the cards it shows, and sending to Anki or exporting TSV downloads the units of the cards being sent first. A reference card takes 100 to 120 bytes whatever the question's length, which keeps the full-catalog state at under half of the 4 MiB account limit; copying text had put it at 98%.

- **Older cards keep their text.** Cards saved before version 8 carry `skillName`, `front`, `back`, and `format`, and are shown, sent, and exported exactly as saved. They are not converted, so notes already in a collection are never rewritten from today's catalog. When two devices hold the same card, a card already sent to Anki wins, text included.
- **Catalog edits reach referenced cards.** A referenced card shows its question as the catalog has it now, as attempts do. A note already created in Anki keeps its fields until lessdumb sends the card again, which happens only after switching to another Anki profile.
- **A question removed from the catalog** leaves its card without text: the Flashcards page says so, sending reports the card as failed and keeps it queued, and the TSV export leaves it out. Keep question IDs stable (see [knowledge points](knowledge-points.md#authoring)).

The **lessdumb** note type has `Front`, `Back`, and `Skill` fields, with one recall card template. The client escapes plain text and code before inserting them into Anki HTML. It adds a `lessdumb` tag, an encoded identity tag, an encoded skill tag, and a mastery or mistake tag. Updating fields preserves the note ID, Anki review scheduling, and any tags you add yourself.

The browser uses AnkiConnect's documented JSON API at `http://127.0.0.1:8765`; requests stay on your computer. The first request is `requestPermission`, which returns immediately for trusted origins and can prompt in Anki for other origins. The client then checks API version 6, the active profile, and available decks. It never automatically switches profiles. If the profile changes after connection, sending stops until you reconnect. Older AnkiConnect versions without `getActiveProfile` are supported only when they have exactly one profile, with the connection marked as inferred.

Cards remain in the application's queue when Anki is closed, a permission is missing, or creation fails. Retry after fixing the reported issue. If a network response is lost after Anki saves a card, the next retry finds that saved note by its stable tag.

Saving a note locally is separate from uploading it to AnkiWeb. Use **Sync** in Anki. Anki also supports automatic sync when opening or closing a profile. lessdumb uses the supported desktop add-on rather than an undocumented web-login or account API.

For manual import, **Export for Anki** downloads a UTF-8 TSV with Anki's separator, HTML, column, and tags-column headers. The Front and Back fields preserve Python indentation and line breaks, convert tabs to four spaces, escape literal HTML characters, and lay out math as described below. Import the file through **File → Import** in Anki and map Front, Back, and Tags as shown in the preview. The export includes stable lessdumb identity tags. See Anki's [text-file import documentation](https://docs.ankiweb.net/importing/text-files.html).

## Math in cards

Lessons write math as `$…$` and `$$…$$` (see [math notation](knowledge-points.md#math-notation)). Anki typesets math with its built-in MathJax, which recognizes only `\(…\)` and `\[…\]`, so a card's prose is sent with those delimiters: `$x^2$` becomes `\(x^2\)`, `$$…$$` becomes `\[…\]`, and `\$` becomes a plain `$`, which MathJax leaves alone. MathJax skips `<pre>` and `<code>` (Anki keeps MathJax's default `skipHtmlTags`; checked in Anki's bundled `mathjax.js`), so prose goes in a `<div>` with `white-space:pre-wrap`, and code, a program's output, a typed question's accepted answer (with its unit), and backtick code spans go in `<pre>` or `<code>`, where nothing is typeset. AnkiConnect and the TSV export use the same layout.

This applies to mistake cards made since CEN-128. They keep prose and code apart: `format: 'prose'` marks a card whose `front` and `back` are authored prose with code in fenced blocks, as in Markdown (`src/lib/card-text.ts`). A referenced mistake card gets this text from its question; cards saved between CEN-128 and version 8 store it. The Flashcards page typesets their math with KaTeX.

**No migration.** Older mistake cards keep the plain text they were saved with and show it as written, TeX source included, on the Flashcards page, in AnkiConnect fields, and in the TSV `<pre>`. Their text cannot be split back safely: it mixes the question's program into the prose, and `\$` was already turned into `$`, so a literal dollar and a math delimiter look alike. Rebuilding them from the current catalog would rewrite notes already in learners' collections with today's question text. A new mistake on the same question keeps the existing card, as before. Mastery cards are authored as plain text and have no math.

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
