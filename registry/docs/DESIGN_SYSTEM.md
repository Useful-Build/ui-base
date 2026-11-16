# Design system

This app runs on [shadcn/ui](https://ui.shadcn.com) (Radix base) and Tailwind v4, installed from the private `wasimjalali/ui-base` registry. The look comes from the base's token file, the app's own overrides and a set of restyled components.

## Layers

| Layer | Where | Rule |
|---|---|---|
| Base tokens | `src/ui-base.css` (Vite) or `app/ui-base.css` (Next.js) | Owned by the base: updates rewrite it, so never edit it. Every role token for light (`:root`) and dark (`.dark`), the Tailwind theme, base styles and helpers. Tailwind's stock palette is off (`--color-*: initial`), so `bg-white` or `text-red-500` don't compile. |
| App CSS | `src/index.css` (Vite) or `app/globals.css` (Next.js) | Owned by the app: installed once, never overwritten. Imports Tailwind and `ui-base.css`, then overrides token values in its `:root` and `.dark` blocks. With `ui-base.css`, the only files with color values. |
| Components | `components/ui/*.tsx` | shadcn components, owned and restyled. Variants and sizes through `cva`. |
| Icon seam | `components/ui/icon.tsx` | The one place icons come from. See [Icons](#icons). |
| App pieces | your own folders | Compose components with Tailwind classes. No colors, no one-off sizes. |

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

`lib/utils.ts` teaches tailwind-merge these scales, so `cn('text-md', 'leading-6')` keeps both classes. When you add a size, weight, shadow or tracking name to the app CSS file, add it there too.

## Components

Use the component before building a look by hand:

- `Button` with variants `default`, `secondary`, `outline`, `soft`, `ghost`, `link` and `destructive`, and sizes `sm`, `default`, `lg`, `icon`, `icon-sm` and `icon-lg`. Disabled controls fade to half opacity. Use `asChild` to render a link as a button.
- `Badge`, `Card`, `Input`, `Textarea`, `Label`, `Checkbox`, `Switch`, `Toggle`, `ToggleGroup` (segmented control), `Select`, `DropdownMenu`, `Popover`, `Tooltip`, `Dialog`, `Sheet`, `Command`, `Avatar`, `Separator`, `Skeleton`.

To add another shadcn component: `npx shadcn@latest add <name>`. Then swap its lucide imports for `Icon`, restyle it with the tokens above, and check it in light and dark.

## Icons

Components never import an icon library. They render `<Icon name="check" />` from `components/ui/icon.tsx`, with the same props everywhere: `name`, `size`, `weight`, `fill`, `style` and `className`. Names are Material-style (`search`, `close`, `check`, `unfold_more`, `expand_less`, `expand_more`, `chevron_right`).

That file is the icon seam. The base maps the names to lucide-react, with `weight` turned into a stroke width (300 is 1.5, 400 is 2, 500 is 2.25). An app with its own icon set (Material Symbols, say) replaces only that file and keeps the props, so every component stays identical across apps. An unknown name throws, so a missing icon fails loud instead of rendering nothing. The file is app-owned: `update` never overwrites it.

## Restyling an app

Every app starts from the same tokens and components. To give it its own look:

1. **Override token values** in the app CSS file (`src/index.css` or `app/globals.css`), in the `:root` block for light and the `.dark` block for dark, after the `ui-base.css` import: colors, `--radius`, shadows. Keep the names. Every component follows. Never edit `ui-base.css`.
2. **Change component variants** in `components/ui/*.tsx` when a shape or state should differ for the whole app: add or edit a `cva` variant, never a one-off class on a single screen.
3. **Never hard-code** a color, size or shadow in a screen. If no token fits, add one to the app CSS file (light and dark), map it in an `@theme inline` block there (`--color-name: var(--name);`) and use it through its class.

## Updating

Update with the `update` items, never with `base` again (that resets the app CSS file):

- Vite: `npx shadcn@4.23.0 add wasimjalali/ui-base/update -y --overwrite`
- Next.js: `npx shadcn@4.23.0 add wasimjalali/ui-base/update-next -y --overwrite`
- Regression suite: `npx shadcn@4.23.0 add wasimjalali/ui-base/regression-suite-update -y --overwrite`

They rewrite `ui-base.css`, `components/ui/`, `lib/utils.ts`, the token check, this guide and the suite's own files. The app CSS file and `e2e/ui/routes.ts` stay as they are. Component variants you changed are rewritten too, so review the diff and reapply them before committing.

## Dark mode

The tokens switch on a `dark` class on `<html>`. In Vite, the template's `ThemeProvider` (`components/theme-provider.tsx`, mounted in `main.tsx`) sets it. In Next.js, the template's `ThemeProvider` wraps `next-themes` with `attribute="class"` in `app/layout.tsx`. Both follow the system setting by default. Components never check the theme; tokens do the switching. A `dark:` variant is for the rare case a token can't express.

## Checks

- **`npm run lint:tokens`** runs `scripts/check-tokens.mjs`, which fails on any hex, color function, named CSS color or stock Tailwind palette class outside `ui-base.css` and the app CSS file. A color function that only wraps tokens (`color-mix(in oklab, var(--brand) 40%, transparent)`) is fine. Add it to `package.json`: `"lint:tokens": "node scripts/check-tokens.mjs src"` (Next.js: `app components lib`). Content art that is a picture rather than UI goes in the small `ALLOWED` list at the top of the script.
- **The regression suite** (`npx shadcn@4.23.0 add wasimjalali/ui-base/regression-suite`) adds `playwright.config.ts` and `e2e/ui/`. It takes a screenshot of every route in `e2e/ui/routes.ts` in light and dark, on desktop and phone, and runs axe (WCAG 2.1 AA) on each. A shot fails past 100 changed pixels. The first run writes the baselines; commit them, and update them on purpose with `--update-snapshots` when a change is meant to show. Baselines are per OS (the file name ends in `darwin` or `linux`), so CI writes and commits its own on its OS once. Update the suite with `regression-suite-update`, which leaves `routes.ts` alone.
