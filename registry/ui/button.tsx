import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

// Focus uses the app-wide :focus-visible outline from ui-base.css.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-sm font-strong whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-primary-foreground hover:bg-destructive/90",
        outline: "border border-input bg-card text-foreground hover:bg-accent",
        secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-fill-hover",
        soft: "bg-fill text-foreground hover:bg-fill-hover",
        ghost: "text-foreground-3 hover:text-foreground",
        link: "rounded-xs text-foreground hover:underline",
      },
      size: {
        default: "h-8 px-[13px]",
        sm: "h-7 gap-1 px-2.5 text-xs",
        lg: "h-9.5 rounded-lg px-[15px] text-base",
        icon: "size-8 rounded-lg",
        "icon-sm": "size-7 rounded-lg",
        "icon-lg": "size-9 rounded-lg",
      },
    },
    compoundVariants: [
      // A link is text: no box.
      { variant: "link", class: "h-auto px-0" },
      // Ghost icon buttons: a soft square on hover, the glyph keeps its color.
      { variant: "ghost", size: ["icon", "icon-sm", "icon-lg"], class: "text-foreground-3 hover:bg-foreground/5 hover:text-foreground-3" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
