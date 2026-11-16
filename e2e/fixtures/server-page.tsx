// A Next.js server component page (no "use client"): importing these components here must build. A component that
// uses hooks or context without "use client" fails `next build` on this page.
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function ServerCheck() {
  return (
    <main className="flex min-h-svh flex-col gap-4 bg-background p-8 text-foreground">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Server component</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Save</Button>
          <Badge variant="secondary">Live</Badge>
          <ToggleGroup type="single" defaultValue="week" aria-label="Range">
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>
    </main>
  )
}
