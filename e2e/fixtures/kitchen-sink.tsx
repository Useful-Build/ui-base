"use client"

// Kitchen sink for the E2E: every ui-base component on one page. `?open=<name>` renders one pop-up open on its own
// (dialog, dropdown, select, popover, tooltip, sheet, command) so the regression suite can shoot it.
import * as React from "react"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command"
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const OPEN_STATES = ["dialog", "dropdown", "select", "popover", "tooltip", "sheet", "command"] as const
type OpenState = (typeof OPEN_STATES)[number]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="mono-label">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}

function DialogDemo({ open }: { open?: boolean }) {
  return (
    <Dialog defaultOpen={open}>
      <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>The new name shows everywhere the project appears.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="project-name">Name</Label>
          <Input id="project-name" defaultValue="Spring launch" />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DropdownDemo({ open }: { open?: boolean }) {
  return (
    <DropdownMenu defaultOpen={open} modal={false}>
      <DropdownMenuTrigger asChild><Button variant="outline">Open menu <Icon name="expand_more" size={16} /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem>Profile <DropdownMenuShortcut>⌘P</DropdownMenuShortcut></DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Show status bar</DropdownMenuCheckboxItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite people</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SelectDemo({ open }: { open?: boolean }) {
  return (
    <Select defaultValue="weekly" defaultOpen={open}>
      <SelectTrigger className="w-48" aria-label="Report frequency"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frequency</SelectLabel>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function PopoverDemo({ open }: { open?: boolean }) {
  return (
    <Popover defaultOpen={open}>
      <PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger>
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the size of the layer.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-3 flex flex-col gap-2">
          <Label htmlFor="width">Width</Label>
          <Input id="width" defaultValue="100%" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TooltipDemo({ open }: { open?: boolean }) {
  return (
    <Tooltip defaultOpen={open}>
      <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  )
}

function SheetDemo({ open }: { open?: boolean }) {
  return (
    <Sheet defaultOpen={open}>
      <SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Changes save when you press Save.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4">
          <Label htmlFor="sheet-name">Name</Label>
          <Input id="sheet-name" defaultValue="Ada Lovelace" />
        </div>
        <SheetFooter><Button>Save</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function CommandItems() {
  return (
    <>
      <CommandInput placeholder="Type a command or search" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>Profile <CommandShortcut>⌘P</CommandShortcut></CommandItem>
          <CommandItem>Billing <CommandShortcut>⌘B</CommandShortcut></CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  )
}

function CommandDemo({ open }: { open?: boolean }) {
  return (
    <CommandDialog defaultOpen={open}>
      <CommandItems />
    </CommandDialog>
  )
}

const OPEN: Record<OpenState, () => React.ReactNode> = {
  dialog: () => <DialogDemo open />,
  dropdown: () => <DropdownDemo open />,
  select: () => <SelectDemo open />,
  popover: () => <PopoverDemo open />,
  tooltip: () => <TooltipDemo open />,
  sheet: () => <SheetDemo open />,
  command: () => <CommandDemo open />,
}

function Gallery() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-title">Kitchen sink</h1>
        <p className="text-md text-foreground-3">Every ui-base component, in the app's own tokens.</p>
      </header>

      <Section title="Buttons">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Delete</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" variant="ghost" aria-label="Search"><Icon name="search" /></Button>
        <Button disabled>Disabled</Button>
      </Section>

      <Section title="Badges">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Failed</Badge>
        <Badge variant="outline">Outline</Badge>
      </Section>

      <Section title="Fields">
        <div className="flex w-full flex-wrap items-start gap-3">
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Anything we should know" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="terms" defaultChecked />
          <Label htmlFor="terms">Email me updates</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="terms-off" />
          <Label htmlFor="terms-off">Weekly digest</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="airplane" defaultChecked />
          <Label htmlFor="airplane">Auto-save</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sounds" />
          <Label htmlFor="sounds">Sounds</Label>
        </div>
        <SelectDemo />
      </Section>

      <Section title="Toggles">
        <Toggle aria-label="Bold" defaultPressed>Bold</Toggle>
        <Toggle variant="outline" aria-label="Italic">Italic</Toggle>
        <ToggleGroup type="single" defaultValue="week" aria-label="Range">
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
      </Section>

      <Section title="Pop-ups">
        <DialogDemo />
        <DropdownDemo />
        <PopoverDemo />
        <TooltipDemo />
        <SheetDemo />
        <CommandDemo />
      </Section>

      <Section title="Avatars">
        <Avatar size="sm"><AvatarFallback>AL</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>GH</AvatarFallback></Avatar>
        <Avatar size="lg"><AvatarFallback>KJ</AvatarFallback></Avatar>
        <AvatarGroup>
          <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </Section>

      <Section title="Card">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Weekly report</CardTitle>
            <CardDescription>Sent every Monday at 9:00.</CardDescription>
            <CardAction><Badge variant="secondary">On</Badge></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-foreground-2">Revenue, orders and returns for the last seven days.</p>
            <Separator />
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline">Preview</Button>
            <Button>Send now</Button>
          </CardFooter>
        </Card>
        <Command className="w-full max-w-sm rounded-2xl border border-border shadow-card">
          <CommandItems />
        </Command>
      </Section>

      <Section title="Roles">
        <span className="rounded-md bg-brand-tint px-2 py-1 text-sm text-brand-text">Brand</span>
        <span className="rounded-md bg-destructive-tint px-2 py-1 text-sm text-destructive-text">Destructive</span>
        <span className="rounded-md bg-warning-tint px-2 py-1 text-sm text-warning-text">Warning</span>
        <span className="rounded-md bg-tag-green-tint px-2 py-1 text-sm text-tag-green-text">Green</span>
        <span className="rounded-md bg-tag-violet-tint px-2 py-1 text-sm text-tag-violet-text">Violet</span>
        <span className="rounded-md bg-tag-teal-tint px-2 py-1 text-sm text-tag-teal-text">Teal</span>
        <span className="rounded-md bg-tag-brown-tint px-2 py-1 text-sm text-tag-brown-text">Brown</span>
        <span className="font-mono text-sm text-foreground-3">mono 0123456789</span>
      </Section>
    </div>
  )
}

export default function KitchenSink() {
  // Read the open state after mount, so the server render (Next.js) and the first client render match.
  const [open, setOpen] = React.useState<string | null | undefined>(undefined)
  React.useEffect(() => {
    setOpen(new URLSearchParams(window.location.search).get("open"))
  }, [])
  if (open === undefined) return null
  if (open && !(OPEN_STATES as readonly string[]).includes(open)) throw new Error(`Unknown open state: ${open}`)
  return (
    <TooltipProvider>
      <title>Kitchen sink</title>
      <main className="min-h-svh bg-background text-foreground">
        {open ? <div className="p-8">{OPEN[open as OpenState]()}</div> : <Gallery />}
      </main>
    </TooltipProvider>
  )
}
