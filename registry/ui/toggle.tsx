"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Toggle as TogglePrimitive } from "radix-ui"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-strong whitespace-nowrap text-foreground-3 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-fill-picked data-[state=on]:text-foreground data-[state=on]:shadow-xs",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-card",
      },
      size: {
        default: "h-8 min-w-8 px-3",
        sm: "h-7 min-w-7 px-2.5",
        lg: "h-9 min-w-9 px-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
