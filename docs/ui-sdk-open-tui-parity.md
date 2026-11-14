# Canadian AI UI SDK behavior parity in OpenTUI

The [Canadian AI Brand Components](https://github.com/canadian-ai/brand-components/issues/68) full primitive-adoption goal includes terminal interfaces where a behavior has a terminal equivalent.

## Runtime boundary

- **Browser UI SDK**: `@ui-sdk/core` and `@ui-sdk/react` support DOM focus, ARIA, popup positioning and shadcn components. They are **not** native terminal renderers.
- **Shadcn OpenTUI**: `lib/opentui/terminal-picker.ts` implements DOM-independent interaction semantics: case-insensitive search, disabled-item filtering, roving active selection, arrow/Home/End navigation, Enter selection, Escape cancellation.
- **Command palette**: execute `palette` or `palette <query>` in the terminal session. The UI command displays matching commands in the existing menu renderer. Selection intentionally **does not execute** commands automatically. The user must explicitly run a selected command.
- Native OpenTUI consumers can use the exported pure picker state functions without importing React DOM or the beta UI SDK runtime. The current browser wrapper keeps its existing renderer.

## Verification and follow-up

`bun vitest run test/lib/terminal-picker.test.ts` exercises filtering, wraparound, disabled options, selection, empty results, cancellation, and menu integration.

This is a parity pilot, not the full upstream primitive port. Next: connect reactive query updates and roving active state to native OpenTUI components, then cover focus restore, screen-reader browser accessibility for web surfaces, terminal render snapshots, and broader components such as popup/resize/reorder. Do not claim upstream behavior equivalence without platform-specific tests.
