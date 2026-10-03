# Interface components

lessdumb uses the official shadcn/ui source components with the Radix/Nova preset, Tailwind CSS4 through its Vite plugin, and the free ReUI registry. The Astro React island remains the application owner; navigation, persistence, language-aware grading, and Anki synchronization retain their existing owners.

Setup follows [shadcn's Astro installation](https://ui.shadcn.com/docs/installation/astro), [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite), and [ReUI's registry documentation](https://reui.io/docs/registry). `components.json` records the preset, aliases, stylesheet, and public registry. Free components require no ReUI account, paid blocks, or license key.

## Components in use

- Buttons, badges, cards, inputs, labels, native selects, progress, alerts, accordion, skeletons, and avatars use shadcn/ui.
- Desktop navigation uses NavigationMenu; compact screens use a Sheet. Breadcrumbs identify the current page.
- Account forms use Dialog, with a title, description, focus trap, Escape handling, and explicit focus restoration to the external opener.
- Navigation and account triggers stay disabled until React attaches their handlers. Native navigation links work during server rendering. This follows [Playwright's hydration guidance](https://playwright.dev/docs/navigations#hydration); a browser regression deliberately delays the client script before testing keyboard interaction.
- Flashcard filters use Tabs; daily goals use ToggleGroup; account and Anki sections use CardHeader, CardContent, and CardFooter.
- The graph uses Card and ScrollArea with both scrollbars. SVG nodes and edges are domain-specific visualizations, retaining keyboard selection and automatic viewport centering. The source-owned ScrollArea exposes a viewport ref so selection scrolls the documented Radix viewport.
- Worked examples, solutions, and output use [ReUI CodeBlock](https://reui.io/docs/components/radix/code-block), including lazy syntax grammars and copy controls. Rust/C++ assessments also display their authored behavior checks in a separate CodeBlock above the editor, so signatures and boundary cases are visible without exposing the solution. Editable code uses CodeMirror with documented Python, Rust, and C++ grammars. The shadcn NativeSelect changes the lab language while preserving a separate source buffer per language; ReUI examples and solutions highlight the declared language. Compiler diagnostics preserve line breaks, and compiled editors disclose the source-only transmission to the free sandbox.
- Anki onboarding uses [ReUI Stepper](https://reui.io/docs/components/radix/stepper) for the three setup stages.

## Instructional player

Lessons use a compact title band, shadcn Tabs for Lesson/Practice, a navigable Introduction/Worked example/Practice outline, and one instructional slide at a time. Previous/Next controls move through the introductory paragraphs and labelled worked subgoals. ReUI CodeBlock presents the relevant code excerpt and published result; shadcn Accordion keeps the complete original program or scenario available. The outline shows actual independent answer evidence, not slide-reading progress. It moves below the teaching panel on narrow screens, with keyboard-operable controls and readable body text.

`lesson-content.ts` authors specific walkthroughs for all 48 Python foundations and the first four Rust and C++ skills. The remaining catalog uses its complete existing example, authored explanation, and published result, without inventing intermediate execution traces. All 633 published results remain unchanged. Math Academy's [public lesson description](https://mathacademy.com/how-it-works) and the supplied PDF's scaffolding diagrams informed the presentation; no proprietary teaching text or assets are imported.

Learners can reopen instruction during practice without losing their current selection or code. Opening teaching material for an unanswered question marks that answer as assisted through the existing hint policy. Reading earns no XP, cards, mastery, or retention strength. A newly selected, unread skill does not receive a pending question until the learner starts practice, so its initial teaching cannot accidentally mark the first answer as assisted. Initial learning still requires four independent answers; due reviews retain their existing evidence requirements. The player changes presentation and reference access, not the graph or scheduling model.

`global.css` contains library imports and semantic theme tokens. `workspace.css` contains the course/task/graph layout and lesson typography in the components layer; library utilities retain ownership of control styling. Obsolete widget/navigation styles were removed. Learning and secondary screens are lazy-loaded, so their editor and code-highlighting dependencies load when those screens open.

## Verification

Browser tests cover actual Python, Rust, and C++ mastery and persistence, atomic topic stages, adaptive review interleaving, account/Anki ownership races, course prerequisites, scientific packages, narrow-screen layout, Sheet keyboard focus/navigation, Dialog focus trapping/return, and ancestor-failure gating. The per-user engine findings and product limits are recorded separately in [the engine audit](engine-audit.md) and [account isolation](account-isolation.md).
