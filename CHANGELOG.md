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
