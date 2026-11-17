import * as React from "react"
import { cn } from "@/lib/utils"

// `sm` is a 32px field inside a list row.
function Input({ className, type, size = "default", ...props }: Omit<React.ComponentProps<"input">, "size"> & { size?: "default" | "sm" }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        size === "sm" ? "h-8 px-2.5 text-sm" : "h-9.5 px-3 text-base",
        "w-full min-w-0 rounded-lg border border-input bg-card text-foreground transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-strong file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
        // Focus: a darker border and a soft halo.
        "focus:border-foreground/45 focus:shadow-halo",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
