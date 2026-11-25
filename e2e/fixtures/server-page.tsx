// A Next.js server component page (no "use client"): it imports and renders an export from every component in
// components/ui, so it must build. A component that uses hooks or context without "use client" fails `next build`
// on this page.
import { Attachment, AttachmentContent, AttachmentTitle } from "@/components/ui/attachment"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader } from "@/components/ui/code-block"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import {
  Questionnaire, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireItem, QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceLine, TraceTitle } from "@/components/ui/trace"

export default function ServerCheck() {
  return (
    <main className="flex min-h-svh flex-col gap-4 bg-background p-8 text-foreground">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Server component</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Avatar><AvatarFallback>SC</AvatarFallback></Avatar>
            <Button>Save</Button>
            <Badge variant="secondary">Live</Badge>
            <Icon name="check" />
            <Toggle aria-label="Bold">B</Toggle>
            <ToggleGroup type="single" defaultValue="week" aria-label="Range">
              <ToggleGroupItem value="day">Day</ToggleGroupItem>
              <ToggleGroupItem value="week">Week</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Separator />
          <Label htmlFor="server-name">Name</Label>
          <Input id="server-name" defaultValue="Spring launch" />
          <Textarea aria-label="Notes" defaultValue="Notes" />
          <div className="flex items-center gap-3">
            <Checkbox aria-label="Done" defaultChecked />
            <Switch aria-label="Live" defaultChecked />
          </div>
          <Select defaultValue="weekly">
            <SelectTrigger aria-label="Frequency"><SelectValue placeholder="Frequency" /></SelectTrigger>
          </Select>
          <div className="flex flex-wrap gap-3">
            <Dialog><DialogTrigger>Open dialog</DialogTrigger></Dialog>
            <Sheet><SheetTrigger>Open sheet</SheetTrigger></Sheet>
            <Popover><PopoverTrigger>Open popover</PopoverTrigger></Popover>
            <DropdownMenu><DropdownMenuTrigger>Open menu</DropdownMenuTrigger></DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>Hover</TooltipTrigger>
                <TooltipContent>Tip</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Command className="rounded-lg border border-border">
            <CommandInput placeholder="Search" />
            <CommandList><CommandItem>Inbox</CommandItem></CommandList>
          </Command>
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-wrap items-center gap-3">
            <Spinner />
            <Progress value={40} aria-label="Progress" className="w-32" />
            <HoverCard><HoverCardTrigger>Hover card</HoverCardTrigger></HoverCard>
          </div>
          <Collapsible>
            <CollapsibleTrigger>Details</CollapsibleTrigger>
            <CollapsibleContent>More</CollapsibleContent>
          </Collapsible>
          <ScrollArea className="h-16"><p>Scrolling text</p></ScrollArea>
          <Tabs defaultValue="a">
            <TabsList><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList>
            <TabsContent value="a">Tab A</TabsContent>
          </Tabs>
          <Item variant="outline"><ItemContent><ItemTitle>Item</ItemTitle></ItemContent></Item>
          <InputGroup>
            <InputGroupAddon><Icon name="search" size={16} /></InputGroupAddon>
            <InputGroupInput aria-label="Search" />
          </InputGroup>
          <Marker variant="separator"><MarkerContent>Today</MarkerContent></Marker>
          <div className="h-40">
            <MessageScrollerProvider>
              <MessageScroller>
                <MessageScrollerViewport aria-label="Conversation">
                  <MessageScrollerContent>
                    <MessageScrollerItem messageId="1">
                      <Message align="end"><MessageContent><Bubble><BubbleContent>Hello</BubbleContent></Bubble></MessageContent></Message>
                    </MessageScrollerItem>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
              </MessageScroller>
            </MessageScrollerProvider>
          </div>
          <Attachment><AttachmentContent><AttachmentTitle>report.pdf</AttachmentTitle></AttachmentContent></Attachment>
          <Trace>
            <TraceLine><TraceTitle>Searched orders</TraceTitle></TraceLine>
            <TraceCollapsible>
              <TraceCollapsibleTrigger><TraceLine><TraceTitle>Read 3 sources</TraceTitle></TraceLine></TraceCollapsibleTrigger>
              <TraceCollapsibleContent>Sources</TraceCollapsibleContent>
            </TraceCollapsible>
          </Trace>
          <CodeBlock>
            <CodeBlockHeader><CodeBlockCopyButton value="npm run build" /></CodeBlockHeader>
            <CodeBlockContent>npm run build</CodeBlockContent>
          </CodeBlock>
          <Questionnaire items={[{ name: "tone", choices: [{ value: "plain" }] }]}>
            <QuestionnaireItem name="tone">
              <QuestionnaireTitle>Tone</QuestionnaireTitle>
              <QuestionnaireChoices><QuestionnaireChoice value="plain">Plain</QuestionnaireChoice></QuestionnaireChoices>
            </QuestionnaireItem>
          </Questionnaire>
        </CardContent>
      </Card>
    </main>
  )
}
