import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9.5 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-base text-foreground transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-strong file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
        // Focus: a darker border and a soft halo (the old .field-input).
        "focus:border-foreground/45 focus:shadow-halo",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
