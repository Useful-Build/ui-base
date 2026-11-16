# ui-base

The shared UI base for every new app, Next.js or Vite: one token file, 20 restyled shadcn/ui components (Radix base, Tailwind v4), an icon seam, a token check, a design system guide and a Playwright regression suite. It's a private shadcn [GitHub registry](https://ui.shadcn.com/docs/registry/github): `registry.json` at the root lists every item, and the sources live in `registry/`. Inhouse is the reference app.

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

`--overwrite` is needed: the token file replaces the template's CSS file (`src/index.css` or `app/globals.css`) whole, and the components replace the template's `button`. Then add the token check to `package.json`:

```json
"lint:tokens": "node scripts/check-tokens.mjs src"
```

For Next.js use `node scripts/check-tokens.mjs app components lib`.

**Regression suite** (opt-in): `npx shadcn@4.23.0 add wasimjalali/ui-base/regression-suite -y --overwrite`, then `npx playwright install chromium`, list your routes in `e2e/ui/routes.ts` and run `npx playwright test`. The first run writes the baselines.

## Items

| Item | What it installs |
|---|---|
| `base`, `base-next` | Everything below except the regression suite, for Vite or Next.js |
| `tokens`, `tokens-next` | The token file, over `src/index.css` or `app/globals.css` |
| `utils` | `lib/utils.ts`: `cn()` with tailwind-merge taught the token scales |
| `icon` | `components/ui/icon.tsx`: the icon seam (lucide-react) |
| `avatar` `badge` `button` `card` `checkbox` `command` `dialog` `dropdown-menu` `input` `label` `popover` `select` `separator` `sheet` `skeleton` `switch` `textarea` `toggle` `toggle-group` `tooltip` | One component each, in `components/ui/` |
| `token-check` | `scripts/check-tokens.mjs` |
| `guide` | `DESIGN_SYSTEM.md` |
| `regression-suite` | `playwright.config.ts` and `e2e/ui/` (visual and axe, light and dark, desktop and phone) |

Single items install the same way: `npx shadcn@4.23.0 add wasimjalali/ui-base/dialog`.

## Updating

Run the same `add` again with `--overwrite` to pull the latest base:

```bash
npx shadcn@4.23.0 add wasimjalali/ui-base/base -y --overwrite
```

This rewrites the token file and components, so review the diff before committing. Pin a release with a tag or a full commit SHA: `wasimjalali/ui-base/base#v1.0.0`. Refs are not passed on to dependencies, which resolve from `main`, so tag releases from `main`.

## Restyling an app

Change token values in the token file (colors for light and dark, `--radius`, type, shadows), and component variants in `components/ui/` for app-wide shape changes. Never hard-code a color or size in a screen; `lint:tokens` fails if you do. Swap `components/ui/icon.tsx` to use a different icon set. Details in `registry/docs/DESIGN_SYSTEM.md`.

## Private access

The repo is private. The shadcn CLI reads it with your GitHub credentials:

- **Locally:** `gh auth login` once. The CLI uses the GitHub CLI's credentials and prints `Using gh credentials.`
- **CI and cloud sessions:** set `GH_TOKEN` to a fine-grained personal access token scoped to `wasimjalali/ui-base` with **Contents: Read-only**. Keep it in the platform's secret store, never in a file.

## Working on the registry

- `npx shadcn@4.23.0 registry validate` checks `registry.json` and every source file.
- `e2e/run.sh <ref>` is the end-to-end proof: it validates the registry at a pushed ref, installs it into fresh Vite and Next.js apps, renders the kitchen sink in `e2e/fixtures/`, builds, runs the token check and the regression suite (twice), and checks that a hard-coded color and a changed token both fail. Run it through `~/.agents/tools/heavy-lock.sh` on the Mac.
