// Every icon name the ui-base components use. Owned by ui-base: `add update` rewrites this file.
// components/ui/icon.tsx (owned by the app) must map each of these names, so when a release adds one, the app's
// type check fails until icon.tsx maps it. CHANGELOG.md lists the new names in each release.
export const ICON_NAMES = [
  "check",
  "chevron_right",
  "close",
  "expand_less",
  "expand_more",
  "search",
  "unfold_more",
] as const

export type IconName = (typeof ICON_NAMES)[number]
