# Changelog

Read the entry for a release before you run `update`, `update-next` or `regression-suite-update`. Each entry lists:

- **Icon names:** names added to `components/ui/icon-names.ts`. Map each one in your `components/ui/icon.tsx`; the type check fails until you do.
- **Tokens:** tokens added, and tokens deprecated in favor of a new name.
- **App-owned files to touch:** anything in the app CSS file, `icon.tsx`, `lib/merge-config.ts`, `scripts/check-tokens.allow.json` or `e2e/ui/routes.ts` the app must change by hand, since updates never ship those files.

Rules every release follows:

- **Tokens are never renamed outright.** A release adds the new name as an alias of the old one (`--new: var(--old);`) in both `:root` and `.dark` of `ui-base.css`, keeps the old name's values for at least one release and lists it here as deprecated. Components read the new name, which follows the old one, so an app's override of either name reaches them. `lint:tokens` flags an override of the old name once it's gone.
- **The app CSS starter is frozen.** Every app owns its copy of `src/index.css` or `app/globals.css`, so a release never changes the starter. Anything new (a token, a base style, a helper) ships in `ui-base.css`.
- **App-owned files never ship in an update item.** Anything an app is told to edit is installed once by `base`, `base-next` or `regression-suite`.
- **Newly adopted components are named here.** A component an app added from upstream shadcn is the app's own until ui-base adopts it. The release that adopts one names it, since the update then rewrites the app's copy: review that file's diff.

## v2.0.0 (2026-11-25)

Chat and agent components from shadcn/ui, restyled with the role tokens. Major because of the new icon names below: the app's type check fails until it maps them.

- **New components (16):** `collapsible`, `hover-card`, `scroll-area`, `tabs`, `progress`, `spinner`, `item`, `input-group`, `message`, `bubble`, `marker`, `attachment`, `message-scroller`, `trace`, `code-block` and `questionnaire`. Vendored from shadcn's `radix-nova` style on 2026-11-25 (each file names its source) and restyled: `Icon` instead of lucide, role tokens only, `cn` from `@/lib/utils`, the app-wide focus outline instead of focus rings, and our type and radius scales. Each is its own item and ships in `base`, `base-next`, `update` and `update-next`. Notes:
  - `Bubble`'s `default` variant is the person's own message, a soft neutral fill (`bg-fill-hover`), not upstream's `primary` fill. `tinted` uses `bg-brand-tint`, since upstream's computed `oklch(from var(--primary) ...)` fails `lint:tokens`.
  - `CodeBlock` renders plain text. ui-base never installs `use-highlighted-code` or shiki.
  - `Trace`: lines read `text-foreground-3`, and a `pending` line steps down to `text-muted-foreground` instead of fading to 60% opacity, so it keeps 4.5:1.
  - `Spinner` is the `progress_activity` icon in a `span role="status"` with a `label` (default "Loading"). Size it with a `size-*` class on the span.
  - `Collapsible`'s content unmounts while closed (Radix has no keep-mounted option): a test that expects closed content in the DOM must change, or pass `forceMount`.
  - `ItemGroup` has `role="list"`: give each `Item` inside it `role="listitem"`, or axe fails.
  - **Newly adopted:** an app that added any of these 16 from upstream shadcn has its copy rewritten by the update. Review those files' diffs.
- **Button:** a new size, `icon-xs` (24px), which `AttachmentAction` and `CodeBlockCopyButton` use. Nothing else in the existing 20 components changed.
- **Icon names (breaking):** `arrow_downward`, `content_copy` and `progress_activity`. `icon.tsx` is app-owned and the update doesn't ship it, so map all three there (lucide: `ArrowDown`, `Copy`, `LoaderCircle`). The type check fails until you do.
- **Tokens:** none. `ui-base.css` adds no token but gains:
  - Custom variants `data-open`, `data-closed`, `data-checked`, `data-disabled`, `data-active`, `data-horizontal` and `data-vertical`, which match Radix's `data-state`, `data-disabled` and `data-orientation` and the boolean data attributes `@shadcn/react` sets. They replace Tailwind's built-in `data-disabled:` and the like with a superset: `data-disabled:` now also matches `data-disabled="true"` and skips `data-disabled="false"`.
  - The `shimmer*` and `scroll-fade*` utilities with their `@property` rules and keyframes, copied from the `shadcn` package's `dist/tailwind.css` (shadcn@4.23.0, MIT). `ui-base.css` doesn't `@import "shadcn/tailwind.css"`.
- **Dependency:** `@shadcn/react@0.3.1`, the headless parts under `MessageScroller` and `Questionnaire`, in the four bundles (and in those two items). It's 0.x: the CLI writes it to `package.json` with a `^` range, so change it to the exact `0.3.1` in the app's `package.json` and lockfile. It needs React 19.
- **cn:** components keep `import { cn } from "@/lib/utils"`, which teaches tailwind-merge the token scales. ui-base doesn't adopt the `cn` package (upstream's import since September 2026) yet. `lint:tokens` now fails on `from "cn"` in any file under `components/ui/`, so a component pulled from upstream later can't slip in the plain `cn()`.
- **App-owned files to touch:** `components/ui/icon.tsx`: map the three new names.

**Migrating an app from v1.1.0:**

1. Run `npx shadcn@4.23.0 add Useful-Build/ui-base/update#v2.0.0 -y --overwrite` (Next.js: `update-next`).
2. In `components/ui/icon.tsx`, map `arrow_downward`, `content_copy` and `progress_activity` (lucide: `ArrowDown`, `Copy`, `LoaderCircle`).
3. Pin `@shadcn/react` to exactly `0.3.1` in `package.json` and reinstall.
4. If the app had its own copy of any of the 16 components, review its diff: the update replaced it.
5. If a file in `components/ui/` imports from `"cn"`, change it to `@/lib/utils`.
6. Run the type check, `lint:tokens` and the regression suite. Update the visual baselines on purpose if a screen uses a component that changed.

## v1.1.0 (2026-11-17)

- **Button:** sizes `xs` and `icon-round`. The `outline` variant shows the hover fill while `aria-pressed` is true.
- **Badge:** a `size` variant (`default`, `lg`, `md`; `default` renders what it did before) and variants `warning`, `brand`, `muted` and `status`.
- **Input:** a `size` of `default` or `sm`. **Breaking type change:** the native `size` attribute is no longer part of its props.
- **Sheet:** `SheetContent` takes `overlayProps`, like `Dialog`.
- **Merge seam:** `lib/utils.ts` now merges `appMergeConfig` from the new app-owned `lib/merge-config.ts`, where an app lists the class names of its own `--app-*` tokens so `cn()` keeps them. Empty by default, so `cn()` behaves as before.
- **Icon names:** none.
- **Tokens:** none.
- **App-owned files to touch:** an app on v1.0.0 must add `lib/merge-config.ts` before it runs the update, or `lib/utils.ts` won't compile. Create `src/lib/merge-config.ts` (Vite) or `lib/merge-config.ts` (Next.js), next to `utils.ts`, with this content:

```ts
import type { ConfigExtension } from 'tailwind-merge'

// App-owned. List the class names of your own --app-* tokens here (text sizes, shadows, tracking, leading, radius,
// animate, container and spacing names, extra class groups) so cn() doesn't drop them next to a base class. Installed
// once, never updated.
export const appMergeConfig: ConfigExtension<string, string> = {
  extend: {
    theme: {},
    classGroups: {},
  },
}
```

New installs get it from `base` and `base-next`; updates never ship it. An app that passes `size` to `Input` as the native attribute must remove it.

## v1.0.0 (2026-11-16)

First release.

- **Icon names:** `check`, `chevron_right`, `close`, `expand_less`, `expand_more`, `search`, `unfold_more`.
- **Tokens:** the full role token set in `ui-base.css`, light and dark. See `DESIGN_SYSTEM.md`.
- **App-owned files to touch:** none.
