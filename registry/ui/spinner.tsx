import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"

// From shadcn/ui radix-nova (ui.shadcn.com/r/styles/radix-nova/spinner.json), fetched 2026-11-25. Restyled for ui-base.
// A status region around the icon, so it's announced; size it with a size-* class (16px by default).
function Spinner({
  className,
  label = "Loading",
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      data-slot="spinner"
      className={cn("inline-flex size-4 shrink-0 animate-spin", className)}
      {...props}
    >
      <Icon name="progress_activity" size={16} className="size-full" />
    </span>
  )
}

export { Spinner }
