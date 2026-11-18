# ui-base

The shared UI base for every new app, Next.js or Vite: a token file, an app CSS starter, 20 restyled shadcn/ui components (Radix base, Tailwind v4), an icon seam, a token check, a design system guide and a Playwright regression suite. It's a private shadcn [GitHub registry](https://ui.shadcn.com/docs/registry/github): `registry.json` at the root lists every item, and the sources live in `registry/`. Inhouse is the reference app.

## Install

Two steps: create the app from the shadcn template, then add the base over it.

**Vite**

```bash
npx shadcn@4.23.0 init --template vite --name my-app -b radix -p nova -y --no-monorepo
cd my-app
npx shadcn@4.23.0 add Useful-Build/ui-base/base -y --overwrite
```

**Next.js**

```bash
npx shadcn@4.23.0 init --template next --name my-app -b radix -p nova -y --no-monorepo
cd my-app
npx shadcn@4.23.0 add Useful-Build/ui-base/base-next -y --overwrite
```

`--overwrite` is needed: the app CSS starter replaces the template's CSS file (`src/index.css` or `app/globals.css`), and the components replace the template's `button`. In Next.js, keep the template's `next/font` in `app/layout.tsx`: it supplies Geist and Geist Mono. Then add the token check to `package.json`:

```json
"lint:tokens": "node scripts/check-tokens.mjs src"
```

For Next.js use `node scripts/check-tokens.mjs app components lib`.

**Regression suite** (opt-in): `npx shadcn@4.23.0 add Useful-Build/ui-base/regression-suite -y --overwrite`, then `npx playwright install chromium`, list your routes in `e2e/ui/routes.ts` (with the app's own axe exclusions and screenshot masks in its `AXE_EXCLUDE` and `MASKS`) and run `npx playwright test -c playwright.ui.config.ts`. The config has its own name so it never overwrites an app's `playwright.config.ts`. The first run writes the baselines. They're per OS (`darwin` or `linux` in the file name), so CI writes and commits its own once.

## Base-owned and app-owned files

An update must never reset an app's brand or shrink its test suite, so the files are split:

Anything an app is told to edit is app-owned: `base` or `base-next` (or `regression-suite`) installs it once, and no update item ships it. Everything else is base-owned and rewritten on update.

| File | Owner | On update |
|---|---|---|
| `ui-base.css` (`src/` or `app/`): role tokens, Tailwind theme, base styles, helpers | base | rewritten |
| `src/index.css` or `app/globals.css`: the app CSS file, with imports, then the app's `:root` and `.dark` overrides | app | left alone |
| `components/ui/icon.tsx`: the icon seam, the app's map from icon names to its icon set | app | left alone |
| `lib/merge-config.ts`: the class names of the app's own `--app-*` tokens, for `cn()` | app | left alone |
| `components/ui/icon-names.ts`: every icon name the components use | base | rewritten |
| `components/ui/` (every other file), `lib/utils.ts`, `scripts/check-tokens.mjs`, `DESIGN_SYSTEM.md` | base | rewritten |
| `scripts/check-tokens.allow.json`: content art the token check allows | app | left alone |
| `playwright.ui.config.ts`, `e2e/ui/support.ts`, `e2e/ui/*.spec.ts` | base | rewritten |
| `e2e/ui/routes.ts` | app | left alone |

The app CSS starter is frozen: a release never changes it, since every app owns its copy. Anything new (a token, a base style, a helper) ships in `ui-base.css`.

## Items

| Item | When | What it installs |
|---|---|---|
| `base`, `base-next` | first install | Everything below for Vite or Next.js, including the app CSS starter, except the regression suite |
| `update`, `update-next` | updates | The same, minus the app-owned files: the app CSS starter, `icon.tsx`, `lib/merge-config.ts` and `check-tokens.allow.json` |
| `regression-suite` | first install | `playwright.ui.config.ts` and `e2e/ui/` (visual and axe, light and dark, desktop and phone), including `routes.ts` |
| `regression-suite-update` | updates | The same, minus `routes.ts` |
| `tokens`, `tokens-next` | | `ui-base.css` alone, at `src/ui-base.css` or `app/ui-base.css` |
| `utils` | | `lib/utils.ts`: `cn()` with tailwind-merge taught the token scales. It imports `lib/merge-config.ts`, which only `base` and `base-next` install |
| `icon` | | `components/ui/icon.tsx`, the icon seam (lucide-react), and `components/ui/icon-names.ts` |
| `avatar` `badge` `button` `card` `checkbox` `command` `dialog` `dropdown-menu` `input` `label` `popover` `select` `separator` `sheet` `skeleton` `switch` `textarea` `toggle` `toggle-group` `tooltip` | | One component each, in `components/ui/` |
| `token-check` | | `scripts/check-tokens.mjs` (create `scripts/check-tokens.allow.json` yourself if you need it) |
| `guide` | | `DESIGN_SYSTEM.md` |

Single items install the same way: `npx shadcn@4.23.0 add Useful-Build/ui-base/dialog`. A single component item doesn't bring `ui-base.css` or the app CSS file, so install `base` or `base-next` first; without them the component's classes have no tokens. Don't add a single component item with `--overwrite` to an app that has the base: the items that render `Icon` (`checkbox`, `command`, `dialog`, `dropdown-menu`, `select` and `sheet`) pull in `icon` through `registryDependencies`, and `--overwrite` then replaces the app-owned `icon.tsx` too. Add single items without `--overwrite`, or update through the update items.

A single component or `utils` added to an app that never installed `base` or `base-next` needs `lib/merge-config.ts` added by hand, because `utils` imports it and no single item ships it. Create it (`src/lib/merge-config.ts` for Vite, `lib/merge-config.ts` for Next.js) with this content:

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

## Updating

Run the update items, never `base` again (it resets the app CSS file to the starter):

```bash
npx shadcn@4.23.0 add Useful-Build/ui-base/update -y --overwrite                    # Vite
npx shadcn@4.23.0 add Useful-Build/ui-base/update-next -y --overwrite               # Next.js
npx shadcn@4.23.0 add Useful-Build/ui-base/regression-suite-update -y --overwrite   # if the app has the suite
```

They rewrite the base-owned files and leave the app-owned ones alone: the app CSS file, `components/ui/icon.tsx`, `lib/merge-config.ts`, `scripts/check-tokens.allow.json` and `routes.ts`. Read [CHANGELOG.md](CHANGELOG.md) for the release: it lists new icon names, new or deprecated tokens and anything app-owned you must touch. A new icon name lands in `icon-names.ts`, and your `icon.tsx` maps names with `satisfies Record<IconName, ...>`, so the type check fails right after the update until you map it. Then run the type check and `lint:tokens` and review the diff before committing. Pin a release with a tag or a full commit SHA: `Useful-Build/ui-base/update#v1.0.0`. The `base`, `update` and suite items (and their Next.js twins) carry all their files themselves, so a pinned ref installs exactly that version. Single component items depend on `utils`, `icon` and so on through `registryDependencies`, and the CLI resolves those from `main` whatever ref you pin (refs are not passed on to dependencies).

## Restyling an app

Override token values in the app CSS file (`src/index.css` or `app/globals.css`), after the `ui-base.css` import. Set every token you override in both blocks, `:root` for light and `.dark` for dark: a token set only in `:root` leaks into dark mode. Never edit `ui-base.css` or anything else base-owned. The app CSS file may only override tokens `ui-base.css` defines; an app-only token starts with `--app-` (`lint:tokens` fails on any other unknown name, so a renamed token can't silently drop an override). App-specific variants live in the app's own components, composed from `components/ui`; a variant every app should get goes to ui-base. Never hard-code a color or size in a screen; `lint:tokens` fails if you do. Swap `components/ui/icon.tsx` to use a different icon set. Details in `registry/docs/DESIGN_SYSTEM.md`.

## Releases

Each release has an entry in [CHANGELOG.md](CHANGELOG.md): new icon names, new, deprecated or renamed tokens and anything app-owned an app must touch. Tokens are never renamed outright: a release adds the new name as an alias of the old one (`--new: var(--old);`, in both `:root` and `.dark` of `ui-base.css`) for at least one release. Components read the new name, which follows the old one, so an app's override of either name still reaches them.

## Private access

The repo is private. The shadcn CLI reads it with your GitHub credentials:

- **Locally:** `gh auth login` once. The CLI uses the GitHub CLI's credentials and prints `Using gh credentials.`
- **CI and cloud sessions:** set `GH_TOKEN` to a fine-grained personal access token scoped to `Useful-Build/ui-base` with **Contents: Read-only**. Keep it in the platform's secret store, never in a file.

## Working on the registry

- `npx shadcn@4.23.0 registry validate` checks `registry.json` and every source file.
- `e2e/run.sh <ref>` is the end-to-end proof: it validates the registry at a pushed ref, installs it into fresh Vite and Next.js apps, renders the kitchen sink in `e2e/fixtures/`, builds (Next.js also builds a server component page that renders every component), runs the token check and the regression suite (twice), and checks that a new icon name, a hard-coded color, an unknown token override and a changed token all fail for the right reason. Then it overrides the brand, adds a route, an axe exclusion and a screenshot mask, and allows a piece of content art, runs the update items and checks that the app-owned files survive byte for byte, the stale base-owned files are rewritten and the suite still passes. Before any of that it checks that each update item is its first-install item minus the app-owned files, with the same dependencies, and runs the token check against the fixtures in `e2e/fixtures/tokens/`. Run it through `~/.agents/tools/heavy-lock.sh` on the Mac.

## License

PolyForm Strict 1.0.0, see [LICENSE](LICENSE).
