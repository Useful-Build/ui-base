"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

// From shadcn/ui radix-nova (ui.shadcn.com/r/styles/radix-nova/collapsible.json), fetched 2026-11-25. Restyled for ui-base.
// Unstyled. CollapsibleContent unmounts while closed (Radix has no keep-mounted option); pass forceMount to keep it.
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
