import type { CSSProperties } from "react"
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Search,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// The icon seam. Components ask for icons by Material-style name; this file decides how they look.
// To give an app its own icon set, replace only this file and keep the same props and names.
const ICONS: Record<string, LucideIcon> = {
  check: Check,
  chevron_right: ChevronRight,
  close: X,
  expand_less: ChevronUp,
  expand_more: ChevronDown,
  search: Search,
  unfold_more: ChevronsUpDown,
}

// Font-style weight to stroke width: 300 -> 1.5, 400 -> 2, 500 -> 2.25.
function strokeWidth(weight: number) {
  if (weight <= 300) return 1.5
  if (weight <= 400) return 1.5 + ((weight - 300) / 100) * 0.5
  return 2 + (Math.min(weight, 500) - 400) / 100 * 0.25
}

/** Weight 300 by default; 400 for status glyphs and 14 px or smaller. */
export function Icon({ name, size = 20, weight, fill, style, className }: {
  name: string; size?: number; weight?: number; fill?: boolean; style?: CSSProperties; className?: string
}) {
  const Glyph = ICONS[name]
  if (!Glyph) throw new Error(`Icon: no icon mapped for "${name}". Add it to ICONS in components/ui/icon.tsx.`)
  const w = weight ?? (size <= 14 ? 400 : 300)
  return (
    <Glyph aria-hidden="true" size={size} strokeWidth={strokeWidth(w)} fill={fill ? "currentColor" : "none"}
      className={cn("shrink-0", className)} style={style} />
  )
}
