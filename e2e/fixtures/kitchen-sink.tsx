"use client"

// Kitchen sink for the E2E: every ui-base component on one page. `?open=<name>` renders one pop-up open on its own
// (dialog, dropdown, select, popover, tooltip, sheet, command, hover-card) so the regression suite can shoot it.
import * as React from "react"

import {
  Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia,
  AttachmentTitle, AttachmentTrigger,
} from "@/components/ui/attachment"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockFooter, CodeBlockHeader, CodeBlockLine, CodeBlockTitle,
} from "@/components/ui/code-block"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import {
  InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message"
import {
  MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import {
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoiceDescription, QuestionnaireChoices,
  QuestionnaireDescription, QuestionnaireError, QuestionnaireInput, QuestionnaireItem, QuestionnaireNext, QuestionnairePrevious,
  QuestionnaireProgress, QuestionnaireSkip, QuestionnaireSubmit, QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle,
} from "@/components/ui/trace"

const OPEN_STATES = ["dialog", "dropdown", "select", "popover", "tooltip", "sheet", "command", "hover-card"] as const
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
      <SheetContent overlayProps={{ className: "z-50" }}>
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

function HoverCardDemo({ open }: { open?: boolean }) {
  return (
    <HoverCard defaultOpen={open} openDelay={200}>
      <HoverCardTrigger asChild><Button variant="link">Ada Lovelace</Button></HoverCardTrigger>
      <HoverCardContent align="start">
        <div className="flex gap-3">
          <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Ada Lovelace</p>
            <p className="text-foreground-3">Writes the weekly report. Joined in March.</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

const QUESTIONS = [{ name: "tone", required: true, choices: [{ value: "plain" }, { value: "warm" }] }] as const

function QuestionnaireDemo() {
  return (
    <Questionnaire items={QUESTIONS} shortcuts="numbers" onSubmit={(e) => e.preventDefault()}
      className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-card">
      <QuestionnaireProgress />
      <QuestionnaireItem name="tone" required>
        <QuestionnaireTitle>How should the weekly report sound?</QuestionnaireTitle>
        <QuestionnaireDescription>Pick one, or write your own.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="plain" defaultChecked>
            <span className="font-medium">Plain</span>
            <QuestionnaireChoiceDescription>Short sentences, numbers first.</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="warm">
            <span className="font-medium">Warm</span>
          </QuestionnaireChoice>
          <QuestionnaireInput aria-label="Another answer" placeholder="Another answer" />
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  )
}

const THREAD = [
  { id: "1", from: "user", text: "How did the spring launch do last week?" },
  { id: "2", from: "agent", text: "Orders rose 18% on the week before. Returns held at 3%." },
  { id: "3", from: "user", text: "Which product led?" },
  { id: "4", from: "agent", text: "The linen shirt, with 412 orders. The canvas tote came second." },
  { id: "5", from: "user", text: "Send me the full report on Monday." },
  { id: "6", from: "agent", text: "Done. It goes out Monday at 9:00." },
] as const

function MessageScrollerDemo() {
  return (
    <div className="h-72 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport aria-label="Conversation" className="px-4">
            <MessageScrollerContent className="py-4">
              {THREAD.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.from === "user"}>
                  <Message align={m.from === "user" ? "end" : "start"}>
                    <MessageContent>
                      <Bubble variant={m.from === "user" ? "default" : "ghost"}>
                        <BubbleContent>{m.text}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="start" />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  )
}

function ChatSection() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Marker variant="separator"><MarkerContent>Today 0:25</MarkerContent></Marker>
      <MessageGroup>
        <Message align="end">
          <MessageContent>
            <Bubble><BubbleContent>Draft the weekly report for the team.</BubbleContent></Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageAvatar><Avatar size="sm"><AvatarFallback>IH</AvatarFallback></Avatar></MessageAvatar>
          <MessageContent>
            <MessageHeader>Agent</MessageHeader>
            <BubbleGroup>
              <Bubble variant="ghost"><BubbleContent>Here's the draft. Revenue is up 12% on last week.</BubbleContent></Bubble>
              <Bubble variant="secondary">
                <BubbleContent>Secondary bubble</BubbleContent>
                <BubbleReactions>+1</BubbleReactions>
              </Bubble>
            </BubbleGroup>
            <MessageFooter>Read 0:26</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
      <div className="flex flex-wrap gap-2">
        <Bubble variant="muted"><BubbleContent>Muted</BubbleContent></Bubble>
        <Bubble variant="tinted"><BubbleContent>Tinted</BubbleContent></Bubble>
        <Bubble variant="outline"><BubbleContent asChild><button type="button">Outline, as a button</button></BubbleContent></Bubble>
        <Bubble variant="destructive"><BubbleContent>Couldn't send</BubbleContent></Bubble>
      </div>
      <Marker><MarkerIcon><Icon name="check" size={16} /></MarkerIcon><MarkerContent>Switched to a faster model</MarkerContent></Marker>
      <Marker variant="border"><MarkerContent>Earlier</MarkerContent></Marker>
    </div>
  )
}

function TraceDemo() {
  return (
    <Trace className="max-w-md">
      <TraceLine>
        <TraceIcon><Icon name="search" size={16} /></TraceIcon>
        <TraceTitle>Searched orders for last week</TraceTitle>
        <TraceDescription>1.2s</TraceDescription>
      </TraceLine>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon><Icon name="check" size={16} /></TraceIcon>
            <TraceTitle>Read 3 sources</TraceTitle>
            <TraceDescription>0.8s</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>Shopify orders, the returns sheet and last week's report.</TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine status="running">
        <TraceIcon><Spinner className="size-3.5" label="Running" /></TraceIcon>
        <TraceTitle>Writing the summary</TraceTitle>
      </TraceLine>
      <TraceLine status="error">
        <TraceIcon><Icon name="close" size={16} /></TraceIcon>
        <TraceTitle>Couldn't reach the ads account</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceIcon><Icon name="chevron_right" size={16} /></TraceIcon>
        <TraceTitle>Send the report</TraceTitle>
      </TraceLine>
    </Trace>
  )
}

const CODE = `{
  "report": "weekly",
  "send": "Monday 9:00",
  "to": ["team"]
}`

function CodeBlockDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>report.json</CodeBlockTitle>
          <CodeBlockActions><CodeBlockCopyButton value={CODE} /></CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers>{CODE}</CodeBlockContent>
        <CodeBlockFooter>4 lines</CodeBlockFooter>
      </CodeBlock>
      <CodeBlock size="sm">
        <CodeBlockContent lineNumbers>
          <CodeBlockLine>{"send: Monday"}</CodeBlockLine>
          <CodeBlockLine variant="removed">{"time: 8:00"}</CodeBlockLine>
          <CodeBlockLine variant="added">{"time: 9:00"}</CodeBlockLine>
          <CodeBlockLine variant="highlighted">{"to: team"}</CodeBlockLine>
        </CodeBlockContent>
      </CodeBlock>
      <CodeBlock variant="destructive" size="sm">
        <CodeBlockContent>{"Error: the ads account timed out"}</CodeBlockContent>
      </CodeBlock>
    </div>
  )
}

function AttachmentDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <AttachmentGroup>
        <Attachment>
          <AttachmentMedia><Icon name="content_copy" size={16} /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>weekly-report.pdf</AttachmentTitle>
            <AttachmentDescription>PDF, 240 KB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger aria-label="Open weekly-report.pdf" />
          <AttachmentActions>
            <AttachmentAction aria-label="Remove weekly-report.pdf"><Icon name="close" size={14} /></AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <Attachment state="uploading">
          <AttachmentMedia><Spinner label="Uploading" /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>returns.csv</AttachmentTitle>
            <AttachmentDescription>Uploading</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment state="error">
          <AttachmentMedia><Icon name="close" size={16} /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>ads.xlsx</AttachmentTitle>
            <AttachmentDescription>Too large</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </AttachmentGroup>
      <div className="flex flex-wrap gap-3">
        <Attachment state="idle" size="sm">
          <AttachmentMedia><Icon name="search" size={16} /></AttachmentMedia>
          <AttachmentContent><AttachmentTitle>Drop a file</AttachmentTitle></AttachmentContent>
        </Attachment>
        <Attachment orientation="vertical">
          <AttachmentMedia><Icon name="content_copy" size={16} /></AttachmentMedia>
          <AttachmentContent><AttachmentTitle>brief.md</AttachmentTitle></AttachmentContent>
        </Attachment>
      </div>
    </div>
  )
}

function ItemDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ItemGroup>
        <Item variant="outline" role="listitem">
          <ItemMedia variant="icon"><Icon name="search" size={16} /></ItemMedia>
          <ItemContent>
            <ItemTitle>Weekly report</ItemTitle>
            <ItemDescription>Sent every Monday at 9:00.</ItemDescription>
          </ItemContent>
          <ItemActions><Button variant="outline" size="sm">Open</Button></ItemActions>
        </Item>
        <Item variant="muted" size="sm" role="listitem">
          <ItemContent><ItemTitle>Returns digest</ItemTitle></ItemContent>
          <ItemActions><Badge variant="secondary">Off</Badge></ItemActions>
        </Item>
      </ItemGroup>
      <ItemSeparator />
      <Item variant="outline" size="xs">
        <ItemHeader><span className="mono-label">Draft</span></ItemHeader>
        <ItemContent><ItemTitle>Spring launch recap</ItemTitle></ItemContent>
        <ItemFooter><span className="text-sm text-foreground-3">Edited 2 hours ago</span></ItemFooter>
      </Item>
    </div>
  )
}

function InputGroupDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputGroup>
        <InputGroupAddon><Icon name="search" size={16} /></InputGroupAddon>
        <InputGroupInput aria-label="Search reports" placeholder="Search reports" />
        <InputGroupAddon align="inline-end"><InputGroupText>12 results</InputGroupText></InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea aria-label="Message" placeholder="Ask the agent" />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-xs" aria-label="Copy"><Icon name="content_copy" size={14} /></InputGroupButton>
          <InputGroupButton variant="default" size="icon-xs" className="ml-auto rounded-full" aria-label="Send"><Icon name="arrow_downward" size={14} /></InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function TabsDemo() {
  return (
    <div className="flex w-full flex-wrap items-start gap-6">
      <Tabs defaultValue="week" className="w-full max-w-sm">
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
        <TabsContent value="week" className="text-foreground-2">Orders for the last seven days.</TabsContent>
      </Tabs>
      <Tabs defaultValue="plain">
        <TabsList variant="line">
          <TabsTrigger value="plain">Plain</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>
        <TabsContent value="plain" className="text-foreground-2">What happened, in words.</TabsContent>
      </Tabs>
    </div>
  )
}

function CollapsibleDemo() {
  return (
    <Collapsible defaultOpen className="flex w-full max-w-sm flex-col gap-2">
      <CollapsibleTrigger asChild><Button variant="outline" className="self-start">Details <Icon name="expand_more" size={16} /></Button></CollapsibleTrigger>
      <CollapsibleContent className="rounded-lg border border-border bg-card p-3 text-foreground-2">Sent to 4 people on Monday.</CollapsibleContent>
    </Collapsible>
  )
}

function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-32 w-56 rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-1 p-2">
        {["Calendar", "Orders", "Returns", "Ads", "Reviews", "Inventory", "Shipping", "Team"].map((name) => (
          <Button key={name} variant="ghost" size="sm" className="justify-start">{name}</Button>
        ))}
      </div>
    </ScrollArea>
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
  "hover-card": () => <HoverCardDemo open />,
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
        <Button size="xs">Extra small</Button>
        <Button variant="outline" aria-pressed="true">Pressed</Button>
        <Button size="icon" variant="ghost" aria-label="Search"><Icon name="search" /></Button>
        <Button size="icon-round" variant="outline" aria-label="Search again"><Icon name="search" /></Button>
        <Button disabled>Disabled</Button>
      </Section>

      <Section title="Badges">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Failed</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="brand">Brand</Badge>
        <Badge variant="muted">Muted</Badge>
        <Badge variant="status">Status</Badge>
        <Badge size="lg">Large</Badge>
        <Badge size="md" variant="secondary">Medium</Badge>
      </Section>

      <Section title="Fields">
        <div className="flex w-full flex-wrap items-start gap-3">
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Label htmlFor="rename">Rename</Label>
            <Input id="rename" size="sm" defaultValue="Spring launch" />
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
        <Select defaultValue="weekly" disabled>
          <SelectTrigger className="w-48" aria-label="Report frequency, locked"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
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
        <HoverCardDemo />
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

      <Section title="Tabs, progress and spinner">
        <TabsDemo />
        <Progress value={60} aria-label="Report progress" className="max-w-sm" />
        <Spinner />
        <Spinner className="size-6" label="Loading the report" />
      </Section>

      <Section title="Items">
        <ItemDemo />
      </Section>

      <Section title="Input group">
        <InputGroupDemo />
      </Section>

      <Section title="Collapsible and scroll area">
        <CollapsibleDemo />
        <ScrollAreaDemo />
      </Section>

      <Section title="Chat">
        <ChatSection />
      </Section>

      <Section title="Message scroller">
        <MessageScrollerDemo />
      </Section>

      <Section title="Attachments">
        <AttachmentDemo />
      </Section>

      <Section title="Trace">
        <TraceDemo />
      </Section>

      <Section title="Code block">
        <CodeBlockDemo />
      </Section>

      <Section title="Questionnaire">
        <QuestionnaireDemo />
      </Section>

      <Section title="Roles">
        <span aria-hidden="true" className="size-7 rounded-md bg-brand" />
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
