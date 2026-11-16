# ui-base

The shared UI base for every new app, Next.js or Vite: a token file, an app CSS starter, 20 restyled shadcn/ui components (Radix base, Tailwind v4), an icon seam, a token check, a design system guide and a Playwright regression suite. It's a private shadcn [GitHub registry](https://ui.shadcn.com/docs/registry/github): `registry.json` at the root lists every item, and the sources live in `registry/`. Inhouse is the reference app.

## Install

Two steps: create the app from the shadcn template, then add the base over it.

**Vite**

```bash
npx shadcn@4.23.0 init --template vite --name my-app -b radix -p nova -y --no-monorepo
cd my-app
npx shadcn@4.23.0 add wasimjalali/ui-base/base -y --overwrite
```

**Next.js**

```bash
npx shadcn@4.23.0 init --template next --name my-app -b radix -p nova -y --no-monorepo
cd my-app
npx shadcn@4.23.0 add wasimjalali/ui-base/base-next -y --overwrite
```

`--overwrite` is needed: the app CSS starter replaces the template's CSS file (`src/index.css` or `app/globals.css`), and the components replace the template's `button`. In Next.js, keep the template's `next/font` in `app/layout.tsx`: it supplies Geist and Geist Mono. Then add the token check to `package.json`:

```json
"lint:tokens": "node scripts/check-tokens.mjs src"
```

For Next.js use `node scripts/check-tokens.mjs app components lib`.

**Regression suite** (opt-in): `npx shadcn@4.23.0 add wasimjalali/ui-base/regression-suite -y --overwrite`, then `npx playwright install chromium`, list your routes in `e2e/ui/routes.ts` and run `npx playwright test`. The first run writes the baselines. They're per OS (`darwin` or `linux` in the file name), so CI writes and commits its own once.

## Base-owned and app-owned files

An update must never reset an app's brand or shrink its test suite, so the files are split:

| File | Owner | On update |
|---|---|---|
| `ui-base.css` (`src/` or `app/`): role tokens, Tailwind theme, base styles, helpers | base | rewritten |
| `src/index.css` or `app/globals.css`: imports, then the app's `:root` and `.dark` overrides | app | left alone |
| `components/ui/`, `lib/utils.ts`, `scripts/check-tokens.mjs`, `DESIGN_SYSTEM.md` | base | rewritten |
| `playwright.config.ts`, `e2e/ui/support.ts`, `e2e/ui/*.spec.ts` | base | rewritten |
| `e2e/ui/routes.ts` | app | left alone |

## Items

| Item | When | What it installs |
|---|---|---|
| `base`, `base-next` | first install | Everything below for Vite or Next.js, including the app CSS starter, except the regression suite |
| `update`, `update-next` | updates | The same, minus the app CSS starter |
| `regression-suite` | first install | `playwright.config.ts` and `e2e/ui/` (visual and axe, light and dark, desktop and phone), including `routes.ts` |
| `regression-suite-update` | updates | The same, minus `routes.ts` |
| `tokens`, `tokens-next` | | `ui-base.css` alone, at `src/ui-base.css` or `app/ui-base.css` |
| `utils` | | `lib/utils.ts`: `cn()` with tailwind-merge taught the token scales |
| `icon` | | `components/ui/icon.tsx`: the icon seam (lucide-react) |
| `avatar` `badge` `button` `card` `checkbox` `command` `dialog` `dropdown-menu` `input` `label` `popover` `select` `separator` `sheet` `skeleton` `switch` `textarea` `toggle` `toggle-group` `tooltip` | | One component each, in `components/ui/` |
| `token-check` | | `scripts/check-tokens.mjs` |
| `guide` | | `DESIGN_SYSTEM.md` |

Single items install the same way: `npx shadcn@4.23.0 add wasimjalali/ui-base/dialog`. A single component item doesn't bring `ui-base.css` or the app CSS file, so install `base` or `base-next` first; without them the component's classes have no tokens.

## Updating

Run the update items, never `base` again (it resets the app CSS file to the starter):

```bash
npx shadcn@4.23.0 add wasimjalali/ui-base/update -y --overwrite                    # Vite
npx shadcn@4.23.0 add wasimjalali/ui-base/update-next -y --overwrite               # Next.js
npx shadcn@4.23.0 add wasimjalali/ui-base/regression-suite-update -y --overwrite   # if the app has the suite
```

They rewrite the base-owned files and leave the app-owned ones alone: the app CSS file, `components/ui/icon.tsx` and `routes.ts`. If a release adds an icon name, its notes list it; add it to your `icon.tsx` (an unknown name throws, so a gap fails loud). Component variants an app changed are rewritten too, so review the diff before committing. Pin a release with a tag or a full commit SHA: `wasimjalali/ui-base/update#v1.0.0`. The `base`, `update` and suite items (and their Next.js twins) carry all their files themselves, so a pinned ref installs exactly that version. Single component items depend on `utils`, `icon` and so on through `registryDependencies`, and the CLI resolves those from `main` whatever ref you pin (refs are not passed on to dependencies).

## Restyling an app

Override token values in the app CSS file (`src/index.css` or `app/globals.css`), in its `:root` block for light and its `.dark` block for dark, after the `ui-base.css` import. Never edit `ui-base.css`. Change component variants in `components/ui/` for app-wide shape changes. Never hard-code a color or size in a screen; `lint:tokens` fails if you do. Swap `components/ui/icon.tsx` to use a different icon set. Details in `registry/docs/DESIGN_SYSTEM.md`.

## Private access

The repo is private. The shadcn CLI reads it with your GitHub credentials:

- **Locally:** `gh auth login` once. The CLI uses the GitHub CLI's credentials and prints `Using gh credentials.`
- **CI and cloud sessions:** set `GH_TOKEN` to a fine-grained personal access token scoped to `wasimjalali/ui-base` with **Contents: Read-only**. Keep it in the platform's secret store, never in a file.

## Working on the registry

- `npx shadcn@4.23.0 registry validate` checks `registry.json` and every source file.
- `e2e/run.sh <ref>` is the end-to-end proof: it validates the registry at a pushed ref, installs it into fresh Vite and Next.js apps, renders the kitchen sink in `e2e/fixtures/`, builds (Next.js also builds a server component page), runs the token check and the regression suite (twice), checks that a hard-coded color and a changed token both fail for the right reason, then overrides the brand and adds a route, runs the update items and checks that the app's files survive byte for byte and the suite still passes. Run it through `~/.agents/tools/heavy-lock.sh` on the Mac.
