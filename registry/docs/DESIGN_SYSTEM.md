# Design system

This app runs on [shadcn/ui](https://ui.shadcn.com) (Radix base) and Tailwind v4, installed from the private `wasimjalali/ui-base` registry. The look comes from the base's token file, the app's own overrides and a set of restyled components.

## Layers

| Layer | Where | Rule |
|---|---|---|
| Base tokens | `src/ui-base.css` (Vite) or `app/ui-base.css` (Next.js) | Owned by the base: updates rewrite it, so never edit it. Every role token for light (`:root`) and dark (`.dark`), the Tailwind theme, base styles and helpers. Tailwind's stock palette is off (`--color-*: initial`), so `bg-white` or `text-red-500` don't compile. |
| App CSS | `src/index.css` (Vite) or `app/globals.css` (Next.js) | Owned by the app: installed once, never overwritten. Imports Tailwind and `ui-base.css`, then overrides token values in its `:root` and `.dark` blocks. With `ui-base.css`, the only files with color values. The starter is frozen: anything new ships in `ui-base.css`. |
| Components | `components/ui/*.tsx` | Owned by the base: updates rewrite them, so never edit them. shadcn components, restyled. Variants and sizes through `cva`. |
| Icon seam | `components/ui/icon.tsx` | Owned by the app. The one place icons come from. See [Icons](#icons). |
| Icon names | `components/ui/icon-names.ts` | Owned by the base. Every icon name the components use, and the `IconName` type. |
| App pieces | your own folders | Compose components with Tailwind classes. No colors, no one-off sizes. App-specific variants live here. |

The rule behind the split: anything an app is told to edit is app-owned, installed once and never shipped by an update. Everything else is base-owned and rewritten on update.

| File | Owner | On update |
|---|---|---|
| `ui-base.css`, `components/ui/` (except `icon.tsx`), `components/ui/icon-names.ts`, `lib/utils.ts`, `scripts/check-tokens.mjs`, this guide | base | rewritten |
| The app CSS file (`src/index.css` or `app/globals.css`) | app | left alone |
| `components/ui/icon.tsx` | app | left alone |
| `lib/merge-config.ts` | app | left alone |
| `scripts/check-tokens.allow.json` | app | left alone |
| `playwright.ui.config.ts`, `e2e/ui/support.ts`, `e2e/ui/*.spec.ts` | base | rewritten |
| `e2e/ui/routes.ts` | app | left alone |

## Tokens

Surfaces pair with a `-foreground` text color, as in shadcn: `bg-card text-card-foreground`.

| Use | Class |
|---|---|
| Page | `bg-background` |
| Card, panel | `bg-card` + `border border-border` + `shadow-card` |
| Menu, dropdown, popover | `bg-popover` + `shadow-menu` |
| Centered window | `bg-dialog` + `shadow-window`, over `bg-scrim` |
| Inset area inside a card | `bg-muted` |
| Hover or selected row on a card or menu | `bg-accent` |
| Soft button, chip, track | `bg-fill`, hover `bg-fill-hover` |
| Picked option of a segmented control | `bg-fill-picked` + `shadow-xs` (a lighter step than its track in both themes) |
| Avatar fallback, switch off | `bg-fill-strong` |
| Primary action | `bg-primary text-primary-foreground` |
| Text, strongest to lightest | `text-foreground`, `text-foreground-2`, `text-foreground-3`, `text-muted-foreground` (lightest allowed for text) |
| Decoration only (never text) | `text-faint` |
| Borders | `border-border` (cards, controls), `border-input` (fields), `border-border-strong` (dashed, hover), `border-divider` (hairlines inside a card) |
| Brand accent: running, live, links | `bg-brand` (or `text-brand`, `border-brand`), `bg-brand-tint`, `text-brand-text` |
| Error, destructive | `bg-destructive` (or `text-destructive`, `border-destructive`), `bg-destructive-tint`, `text-destructive-text` |
| Warning | `bg-warning` (or `text-warning`), `bg-warning-tint`, `text-warning-text`, `text-warning-on-tint` |
| Dark chip on an image | `bg-overlay text-overlay-foreground` (both stay the same in dark mode) |
| Logo tile | `bg-logo-tile text-logo-tile-foreground` (stays light in dark mode, so third-party logos never vanish on a dark card) |
| Categorical tags | `bg-tag-green-tint text-tag-green-text`, and the same for `violet`, `teal` and `brown`. Text on the tint is 4.5:1 or more in both themes. |
| Dotted page background | `bg-dots`, `bg-dots-live` (or `text-` and `fill-` for drawn dots) |
| Sidebar | `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-primary`, `bg-sidebar-accent`, `border-sidebar-border`, `ring-sidebar-ring` (shadcn's sidebar names) |
| Charts | `bg-chart-1` to `bg-chart-5` (or `fill-`, `stroke-`, `text-`) |

For a lighter step of any token use an opacity modifier: `bg-foreground/5` (a hover on any surface), `border-destructive/30`.

## Scales

- **Type:** `text-2xs` 11, `text-xs` 12, `text-sm` 13, `text-base` 14 (body), `text-md` 15, `text-lg` 16, `text-xl` 18, `text-2xl` 24, `text-3xl` 32 (page titles), `text-display` 46. Sizes carry no line height. Text inherits it (body 1.45), so set `leading-*` only where it differs.
- **Weight:** `font-normal` 400, `font-book` 450, `font-medium` 500, `font-strong` 550 (buttons, labels), `font-semibold` 600.
- **Font:** Geist and Geist Mono (`font-sans`, `font-mono`). In Vite, `src/index.css` imports them from the `@fontsource-variable` packages. In Next.js, the template's `next/font` in `app/layout.tsx` loads them and sets `--font-sans` and `--font-mono` on `<html>`, so keep it.
- **Radius:** derived from `--radius` (10px). `rounded-xs` 4, `sm` 6, `md` 8, `lg` 10, `xl` 12, `2xl` 16, `3xl` 20, `full`.
- **Spacing:** Tailwind's 4px scale (`gap-2` = 8px, `p-3.5` = 14px). Prefer whole and half steps.
- **Shadow:** `shadow-xs`, `shadow-card`, `shadow-float`, `shadow-menu`, `shadow-window`, `shadow-halo` (focus).
- **Motion:** 150ms with `ease-out` is the default for `transition-*`. `ease-in-out` is for looping motion. Reduced motion turns animations off.
- **Helpers:** `ellipsis` (one line, cut with an ellipsis) and `mono-label` (small uppercase mono label).

`lib/utils.ts` teaches tailwind-merge these scales, so `cn('text-md', 'leading-6')` keeps both classes. It's base-owned, so a new size, weight, shadow or tracking name goes to ui-base (in `ui-base.css` and `lib/utils.ts`, in a release), not into the app.

## Components

Use the component before building a look by hand:

- `Button` with variants `default`, `secondary`, `outline`, `soft`, `ghost`, `link` and `destructive`, and sizes `xs` (a 22px pill), `sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-lg` and `icon-round` (a floating round button). An `outline` button with `aria-pressed="true"` shows the hover fill. Disabled controls fade to half opacity. Use `asChild` to render a link as a button.
- `Badge` with variants `default`, `secondary`, `destructive`, `warning`, `muted`, `brand`, `outline`, `ghost`, `link` and `status`, and a `size` of `default`, `lg` or `md`. `Input` has a `size` of `default` or `sm` (a 32px field for a list row); the native `size` attribute is not part of its props. `Sheet`'s content takes `overlayProps`, like `Dialog`, for the scrim behind it.
- `Card`, `Textarea`, `Label`, `Checkbox`, `Switch`, `Toggle`, `ToggleGroup` (segmented control), `Select`, `DropdownMenu`, `Popover`, `Tooltip`, `Dialog`, `Sheet`, `Command`, `Avatar`, `Separator`, `Skeleton`.

To add another shadcn component: `npx shadcn@4.23.0 add <name>`, without `--overwrite` (its upstream dependencies could replace ui-base's files). Then swap its lucide imports for `Icon`, restyle it with the tokens above, and check it in light and dark. A component added this way is the app's own until ui-base adopts it. ui-base's `CHANGELOG.md` names each newly adopted component, since the update then rewrites the app's copy, so review that file's diff.

## Icons

Components never import an icon library. They render `<Icon name="check" />` from `components/ui/icon.tsx`, with the same props everywhere: `name`, `size`, `weight`, `fill`, `style` and `className`. Names are Material-style (`search`, `close`, `check`, `unfold_more`, `expand_less`, `expand_more`, `chevron_right`).

That file is the icon seam. The base maps the names to lucide-react, with `weight` turned into a stroke width (300 is 1.5, 400 is 2, 500 is 2.25). An app with its own icon set replaces only that file and keeps the props, so every component stays identical across apps. The file is app-owned: `update` never overwrites it.

The names come from `components/ui/icon-names.ts`, which is base-owned: it exports `ICON_NAMES` and `type IconName`, and updates rewrite it. `icon.tsx` maps them with `satisfies Record<IconName, LucideIcon>` and types `name` as `IconName`. So when a release adds a name, the app's type check fails in `icon.tsx` right after the update, until the app maps it. Keep that check whatever icon set you use:

- **An icon set with components** (lucide, Phosphor): keep a map typed `satisfies Record<IconName, ...>`.
- **A font ligature set with no map** (Material Symbols): the name is the glyph, so nothing forces a check. Keep an exhaustive one anyway, for example `const GLYPHS = { check: "check", close: "close", ... } satisfies Record<IconName, string>`, and render `GLYPHS[name]`. Your own `name` type can be wider than `IconName` (`IconName | AppIconName`) if screens use more icons.

## Restyling an app

Every app starts from the same tokens and components. To give it its own look:

1. **Override token values** in the app CSS file (`src/index.css` or `app/globals.css`), after the `ui-base.css` import: colors, `--radius`, shadows. Set every token you override in both blocks, `:root` for light and `.dark` for dark: a token set only in `:root` leaks into dark mode, since the app CSS file loads after `ui-base.css`. Keep the names; only tokens `ui-base.css` defines can be overridden. Every component follows. Never edit `ui-base.css`.
2. **Don't edit `components/ui/`.** It's base-owned, so an update rewrites it. An app-specific variant lives in an app component composed from `components/ui` (a `PlanBadge` that wraps `Badge` with its own classes, say). A variant every app should have goes to ui-base, in a release.
3. **Never hard-code** a color, size or shadow in a screen. If no token fits, add an app-only token to the app CSS file, named with the `--app-` prefix, in both `:root` and `.dark`. Map it in an `@theme inline` block there (`--color-app-name: var(--app-name);`) and use it through its class (`bg-app-name`). `lint:tokens` fails on an override of any other name `ui-base.css` doesn't define, so a renamed or mistyped token can't silently drop an override.
4. **List your `--app-*` class names in `lib/merge-config.ts`.** `cn()` runs tailwind-merge, which has to know a class name belongs to a scale or it reads it as something else and drops the wrong class when two meet. `lib/utils.ts` teaches it the base's names. An app that adds its own text sizes, shadows, tracking, leading, radius, animate, container or spacing names, or its own class groups, lists them in `appMergeConfig` (`{ extend: { theme: {...}, classGroups: {...} } }`). It's app-owned: installed once by `base` and `base-next`, merged after the base's own names, never updated. Never edit `lib/utils.ts` for this.

## Updating

Update with the `update` items, never with `base` again (that resets the app CSS file):

- Vite: `npx shadcn@4.23.0 add wasimjalali/ui-base/update -y --overwrite`
- Next.js: `npx shadcn@4.23.0 add wasimjalali/ui-base/update-next -y --overwrite`
- Regression suite: `npx shadcn@4.23.0 add wasimjalali/ui-base/regression-suite-update -y --overwrite`

They rewrite the base-owned files: `ui-base.css`, `components/ui/` (except `icon.tsx`), `icon-names.ts`, `lib/utils.ts`, the token check, this guide and the suite's own files. The app-owned files stay as they are: the app CSS file, `icon.tsx`, `lib/merge-config.ts`, `scripts/check-tokens.allow.json` and `e2e/ui/routes.ts`. Read the release's entry in ui-base's `CHANGELOG.md` for new icon names, new or deprecated tokens and anything app-owned to touch, then run the type check and `lint:tokens` and review the diff before committing.

Don't add a single component item with `--overwrite`: the items that render `Icon` (`checkbox`, `command`, `dialog`, `dropdown-menu`, `select` and `sheet`) pull in `icon` through `registryDependencies` and would replace your `icon.tsx`. Use the update items, or add single items without `--overwrite`. A single component or `utils` added to an app that never installed `base` or `base-next` needs `lib/merge-config.ts` added by hand: `utils` imports it and no single item ships it. The content is in the v1.1.0 entry of ui-base's `CHANGELOG.md`.

## Dark mode

The tokens switch on a `dark` class on `<html>`. In Vite, the template's `ThemeProvider` (`components/theme-provider.tsx`, mounted in `main.tsx`) sets it. In Next.js, the template's `ThemeProvider` wraps `next-themes` with `attribute="class"` in `app/layout.tsx`. Both follow the system setting by default. Components never check the theme; tokens do the switching. A `dark:` variant is for the rare case a token can't express.

## Checks

- **`npm run lint:tokens`** runs `scripts/check-tokens.mjs`, which fails on any hex, color function, named CSS color or stock Tailwind palette class outside `ui-base.css` and the app CSS file. Comments are skipped. For a see-through token use an opacity modifier (`bg-brand/50`) or `color-mix(in oklab, var(--brand) 50%, transparent)`; tokens hold hex values, so `rgb(var(--brand) / 0.5)` is invalid CSS. A color function is fine when every channel is a `var()`, or a channel keyword of a relative color from a token (`rgb(from var(--brand) r g b / 50%)`); a number or percentage only as the alpha after the slash, and percentage weights in `color-mix`. Named colors count wherever they're a value: CSS declarations, Tailwind arbitrary values (`shadow-[0_1px_black]`) and style objects. It also fails when the app CSS file's `:root` or `.dark` blocks set a `--name` that `ui-base.css` doesn't define, unless it starts with `--app-`. Add it to `package.json`: `"lint:tokens": "node scripts/check-tokens.mjs src"` (Next.js: `app components lib`). Content art that is a picture rather than UI goes in the app's own `scripts/check-tokens.allow.json`, a JSON array of paths relative to the project root (`["src/art/file-preview.tsx"]`). Never edit the script itself: it's base-owned.
- **The regression suite** (`npx shadcn@4.23.0 add wasimjalali/ui-base/regression-suite`) adds `playwright.ui.config.ts` and `e2e/ui/`; run it with `npx playwright test -c playwright.ui.config.ts`. The config has its own name, so it never overwrites the app's `playwright.config.ts`. It takes a screenshot of every route in `e2e/ui/routes.ts` in light and dark, on desktop and phone, and runs axe (WCAG 2.1 AA) on each. A shot fails past 100 changed pixels. The first run writes the baselines; commit them, and update them on purpose with `--update-snapshots` when a change is meant to show. Baselines are per OS (the file name ends in `darwin` or `linux`), so CI writes and commits its own on its OS once. The app's own known axe issues go in `routes.ts` as `AXE_EXCLUDE` (each skips one rule inside one selector, with a `why`), and content that changes between runs (a clock, a live feed) goes in `MASKS`, selectors covered in every shot. Both start empty. Update the suite with `regression-suite-update`, which leaves `routes.ts` alone.
