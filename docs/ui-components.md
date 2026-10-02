# Interface components

lessdumb uses the official shadcn/ui source components with the Radix/Nova preset, Tailwind CSS4 through its Vite plugin, and the free ReUI registry. The Astro React island remains the application owner; navigation, persistence, Python grading, and Anki synchronization retain their existing owners.

Setup follows [shadcn's Astro installation](https://ui.shadcn.com/docs/installation/astro), [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite), and [ReUI's registry documentation](https://reui.io/docs/registry). `components.json` records the preset, aliases, stylesheet, and public registry. Free components require no ReUI account, paid blocks, or license key.

## Components in use

- Buttons, badges, cards, inputs, labels, native selects, progress, alerts, accordion, skeletons, and avatars use shadcn/ui.
- Desktop navigation uses NavigationMenu; compact screens use a Sheet. Breadcrumbs identify the current page.
- Account forms use Dialog, with a title, description, focus trap, Escape handling, and explicit focus restoration to the external opener.
- Flashcard filters use Tabs; daily goals use ToggleGroup; account and Anki sections use CardHeader, CardContent, and CardFooter.
- The graph uses Card and ScrollArea with both scrollbars. SVG nodes and edges are domain-specific visualizations, retaining keyboard selection and automatic viewport centering. The source-owned ScrollArea exposes a viewport ref so selection scrolls the documented Radix viewport.
- Worked examples, solutions, and output use [ReUI CodeBlock](https://reui.io/docs/components/radix/code-block), including lazy syntax grammars and copy controls. Editable code uses CodeMirror, a specialized editor.
- Anki onboarding uses [ReUI Stepper](https://reui.io/docs/components/radix/stepper) for the three setup stages.

`global.css` contains library imports and semantic theme tokens. `workspace.css` contains the course/task/graph layout and lesson typography in the components layer; library utilities retain ownership of control styling. Obsolete widget/navigation styles were removed. Learning and secondary screens are lazy-loaded, so their editor and code-highlighting dependencies load when those screens open.

## Verification

Browser tests cover actual Python mastery and persistence, account/Anki ownership races, course prerequisites, scientific packages, narrow-screen layout, Sheet keyboard focus/navigation, Dialog focus trapping/return, and ancestor-failure gating. The per-user engine findings and product limits are recorded separately in [the engine audit](engine-audit.md) and [account isolation](account-isolation.md).
