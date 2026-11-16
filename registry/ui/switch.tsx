"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "radix-ui"

// 36x22 with a 16px knob, or 32x20 with a 14px knob (sm). The knob sits 3px from the edge.
// Exported so a visual-only switch (a row that is itself the button) can look the same.
const switchRootClass =
  "peer group/switch relative inline-flex shrink-0 items-center rounded-full p-[3px] transition-colors disabled:pointer-events-none disabled:opacity-50 data-[size=default]:h-[22px] data-[size=default]:w-9 data-[size=sm]:h-5 data-[size=sm]:w-8 data-[state=checked]:bg-primary data-[state=unchecked]:bg-fill-strong"
const switchThumbClass =
  "pointer-events-none block rounded-full bg-card shadow-xs transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3.5 data-[state=unchecked]:translate-x-0 group-data-[size=default]/switch:data-[state=checked]:translate-x-3.5 group-data-[size=sm]/switch:data-[state=checked]:translate-x-3"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(switchRootClass, className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={switchThumbClass}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchRootClass, switchThumbClass }
