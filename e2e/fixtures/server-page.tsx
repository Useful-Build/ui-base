// A Next.js server component page (no "use client"): it imports and renders an export from every component in
// components/ui, so it must build. A component that uses hooks or context without "use client" fails `next build`
// on this page.
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
        </CardContent>
      </Card>
    </main>
  )
}
