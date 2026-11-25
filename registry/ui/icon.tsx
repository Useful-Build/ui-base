import type { CSSProperties } from "react"
import {
  ArrowDown,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  LoaderCircle,
  Search,
  X,
  type LucideIcon,
} from "lucide-react"
import type { IconName } from "@/components/ui/icon-names"
import { cn } from "@/lib/utils"

// The icon seam. Components ask for icons by Material-style name; this file decides how they look.
// Owned by the app: ui-base installs it once and `add update` leaves it alone. To give an app its own icon set,
// replace only this file and keep the same props. Keep the `satisfies Record<IconName, ...>` check: when a release
// adds a name to icon-names.ts, the type check then fails here until the new name is mapped.
const ICONS = {
  arrow_downward: ArrowDown,
  check: Check,
  chevron_right: ChevronRight,
  close: X,
  content_copy: Copy,
  expand_less: ChevronUp,
  expand_more: ChevronDown,
  progress_activity: LoaderCircle,
  search: Search,
  unfold_more: ChevronsUpDown,
} satisfies Record<IconName, LucideIcon>

// Font-style weight to stroke width: 300 -> 1.5, 400 -> 2, 500 -> 2.25.
function strokeWidth(weight: number) {
  if (weight <= 300) return 1.5
  if (weight <= 400) return 1.5 + ((weight - 300) / 100) * 0.5
  return 2 + (Math.min(weight, 500) - 400) / 100 * 0.25
}

/** Weight 300 by default; 400 for status glyphs and 14 px or smaller. */
export function Icon({ name, size = 20, weight, fill, style, className }: {
  name: IconName; size?: number; weight?: number; fill?: boolean; style?: CSSProperties; className?: string
}) {
  const Glyph = ICONS[name]
  if (!Glyph) throw new Error(`Icon: no icon mapped for "${name}". Add it to ICONS in components/ui/icon.tsx.`)
  const w = weight ?? (size <= 14 ? 400 : 300)
  return (
    <Glyph aria-hidden="true" size={size} strokeWidth={strokeWidth(w)} fill={fill ? "currentColor" : "none"}
      className={cn("shrink-0", className)} style={style} />
  )
}
