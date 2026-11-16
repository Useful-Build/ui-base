# Design system

This app runs on [shadcn/ui](https://ui.shadcn.com) (Radix base) and Tailwind v4, installed from the private `wasimjalali/ui-base` registry. The look comes from one token file and a set of restyled components. Inhouse is the reference app: when in doubt about how something should look or be built, look at how Inhouse does it.

## Layers

| Layer | Where | Rule |
|---|---|---|
| Tokens | `src/index.css` (Vite) or `app/globals.css` (Next.js) | The only file with color values. Light in `:root`, dark in `.dark`, same names. Tailwind's stock palette is off (`--color-*: initial`), so `bg-white` or `text-red-500` don't compile. |
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
| Brand accent: running, live, links | `brand`, `bg-brand-tint`, `text-brand-text` |
| Error, destructive | `destructive`, `bg-destructive-tint`, `text-destructive-text` |
| Warning | `warning`, `bg-warning-tint`, `text-warning-text`, `text-warning-on-tint` |
| Dark chip on an image | `bg-overlay text-overlay-foreground` (both stay the same in dark mode) |
| Logo tile | `bg-logo-tile text-logo-tile-foreground` (stays light in dark mode, so third-party logos never vanish on a dark card) |
| Categorical tags | `bg-tag-green-tint text-tag-green-text`, and the same for `violet`, `teal` and `brown`. Text on the tint is 4.5:1 or more in both themes. |
| Dotted page background | `dots`, `dots-live` |
| Sidebar | `sidebar`, `sidebar-foreground`, `sidebar-accent`, `sidebar-border`... (shadcn's sidebar names) |
| Charts | `chart-1` to `chart-5` |

For a lighter step of any token use an opacity modifier: `bg-foreground/5` (a hover on any surface), `border-destructive/30`.

## Scales

- **Type:** `text-2xs` 11, `text-xs` 12, `text-sm` 13, `text-base` 14 (body), `text-md` 15, `text-lg` 16, `text-xl` 18, `text-2xl` 24, `text-3xl` 32 (page titles), `text-display` 46. Sizes carry no line height. Text inherits it (body 1.45), so set `leading-*` only where it differs.
- **Weight:** `font-normal` 400, `font-book` 450, `font-medium` 500, `font-strong` 550 (buttons, labels), `font-semibold` 600.
- **Font:** Geist and Geist Mono (`font-sans`, `font-mono`), from the `@fontsource-variable` packages.
- **Radius:** derived from `--radius` (10px). `rounded-xs` 4, `sm` 6, `md` 8, `lg` 10, `xl` 12, `2xl` 16, `3xl` 20, `full`.
- **Spacing:** Tailwind's 4px scale (`gap-2` = 8px, `p-3.5` = 14px). Prefer whole and half steps.
- **Shadow:** `shadow-xs`, `shadow-card`, `shadow-float`, `shadow-menu`, `shadow-window`, `shadow-halo` (focus).
- **Motion:** 150ms with `ease-out` is the default for `transition-*`. `ease-in-out` is for looping motion. Reduced motion turns animations off.
- **Helpers:** `ellipsis` (one line, cut with an ellipsis) and `mono-label` (small uppercase mono label).

`lib/utils.ts` teaches tailwind-merge these scales, so `cn('text-md', 'leading-6')` keeps both classes. When you add a size, weight, shadow or tracking name to the token file, add it there too.

## Components

Use the component before building a look by hand:

- `Button` with variants `default`, `secondary`, `outline`, `soft`, `ghost`, `link` and `destructive`, and sizes `sm`, `default`, `lg` and `icon`. Use `asChild` to render a link as a button.
- `Badge`, `Card`, `Input`, `Textarea`, `Label`, `Checkbox`, `Switch`, `Toggle`, `ToggleGroup` (segmented control), `Select`, `DropdownMenu`, `Popover`, `Tooltip`, `Dialog`, `Sheet`, `Command`, `Avatar`, `Separator`, `Skeleton`.

To add another shadcn component: `npx shadcn@latest add <name>`. Then swap its lucide imports for `Icon`, restyle it with the tokens above, and check it in light and dark.

## Icons

Components never import an icon library. They render `<Icon name="check" />` from `components/ui/icon.tsx`, with the same props everywhere: `name`, `size`, `weight`, `fill`, `style` and `className`. Names are Material-style (`search`, `close`, `check`, `unfold_more`, `expand_less`, `expand_more`, `chevron_right`).

That file is the icon seam. The base maps the names to lucide-react, with `weight` turned into a stroke width (300 is 1.5, 400 is 2, 500 is 2.25). An app with its own icon set, like Inhouse with Material Symbols, replaces only that file and keeps the props, so every component stays identical across apps. An unknown name throws, so a missing icon fails loud instead of rendering nothing.

## Restyling an app

Every app starts from the same tokens and components. To give it its own look:

1. **Change token values** in the token file: colors for light and dark, `--radius`, the type scale, shadows. Keep the names. Every component follows.
2. **Change component variants** in `components/ui/*.tsx` when a shape or state should differ for the whole app: add or edit a `cva` variant, never a one-off class on a single screen.
3. **Never hard-code** a color, size or shadow in a screen. If no token fits, add one to the token file (light and dark) and use it through its class.

Updating the base later (`npx shadcn@4.23.0 add wasimjalali/ui-base/base --overwrite`) writes the token file and components again, so keep an app's restyle in a commit you can reapply, or review the diff before committing.

## Dark mode

The token file only needs a `dark` class on `<html>`. The Vite template's theme provider and `next-themes` in the Next.js template both set it, and both follow the system setting by default. Components never check the theme; tokens do the switching. A `dark:` variant is for the rare case a token can't express.

## Checks

- **`npm run lint:tokens`** runs `scripts/check-tokens.mjs`, which fails on any hex, `rgb()`, named CSS color or stock Tailwind palette class outside the token file. Add it to `package.json`: `"lint:tokens": "node scripts/check-tokens.mjs src"` (Next.js: `app components lib`). Content art that is a picture rather than UI goes in the small `ALLOWED` list at the top of the script.
- **The regression suite** (`npx shadcn@4.23.0 add wasimjalali/ui-base/regression-suite`) adds `playwright.config.ts` and `e2e/ui/`. It takes a screenshot of every route in `e2e/ui/routes.ts` in light and dark, on desktop and phone, and runs axe (WCAG 2.1 AA) on each. A shot fails past 100 changed pixels. The first run writes the baselines; commit them, and update them on purpose with `--update-snapshots` when a change is meant to show.
