import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-[3px] overflow-hidden rounded-full border border-transparent font-strong whitespace-nowrap transition-colors aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-fill text-foreground-2 [a&]:hover:bg-fill-hover",
        destructive:
          "bg-destructive-tint text-destructive-text",
        warning: "bg-warning-tint text-warning-text",
        muted: "bg-fill-hover text-foreground-2",
        brand: "bg-brand-tint text-brand-text",
        outline:
          "border-input text-muted-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-foreground underline-offset-4 [a&]:hover:underline",
        status: "border-border bg-card text-foreground-2",
      },
      size: {
        default: "h-5 px-[7px] text-2xs",
        lg: "h-6 px-2.25 text-xs",
        md: "min-h-6.5 gap-1.5 px-2.5 text-sm font-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
