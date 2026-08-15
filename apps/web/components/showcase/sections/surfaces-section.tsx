"use client"

import * as React from "react"
import {
  CodeIcon,
} from "@phosphor-icons/react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ScrollArea,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  TextEditor,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Card,
  CardContent,
  Badge,
  Button,
} from "@celestia-project/ui"
import { useTheme } from "next-themes"
import { ShowcaseCard } from "../showcase-card"

const SAMPLE_CHART_DATA = [
  { month: "Jan", requests: 186, latency: 80 },
  { month: "Feb", requests: 305, latency: 65 },
  { month: "Mar", requests: 237, latency: 70 },
  { month: "Apr", requests: 730, latency: 45 },
  { month: "May", requests: 609, latency: 50 },
  { month: "Jun", requests: 814, latency: 40 },
]

const CHART_CONFIG = {
  requests: {
    label: "API Requests",
    color: "hsl(var(--primary))",
  },
  latency: {
    label: "Latency (ms)",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig

const RESIZABLE_CODE = `import * as React from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@celestia-project/ui"

export function ResizableDemo() {
  return (
    <div className="h-36 w-full border rounded-lg overflow-hidden">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="flex h-full items-center justify-center p-3 text-xs bg-muted/20">
            Sidebar (40%)
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="flex h-full items-center justify-center p-3 text-xs">
            Main Editor (60%)
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}`

const SCROLL_AREA_CODE = `import * as React from "react"
import { ScrollArea } from "@celestia-project/ui"

export function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-36 w-full max-w-sm rounded-lg border p-3">
      <h4 className="mb-2 text-xs font-medium">Changelog & Commits</h4>
      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex justify-between border-b pb-1">
            <span>Commit #{1040 + i}</span>
            <span className="font-mono text-[10px]">v1.{i}.0</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}`

const CAROUSEL_CODE = `import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  Card,
  CardContent,
} from "@celestia-project/ui"

export function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {["Next.js 16", "Hono Backend", "Drizzle ORM"].map((item, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="flex aspect-video items-center justify-center p-4">
                <span className="text-xs font-medium">{item}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}`

const CHART_CODE = `import * as React from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
} from "@celestia-project/ui"

const data = [
  { month: "Jan", requests: 186 },
  { month: "Feb", requests: 305 },
  { month: "Mar", requests: 730 },
]

const config = {
  requests: { label: "API Requests", color: "hsl(var(--primary))" },
} satisfies ChartConfig

export function ChartDemo() {
  return (
    <ChartContainer config={config} className="h-36 w-full">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis dataKey="month" fontSize={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="requests" stroke="var(--color-requests)" fill="var(--color-requests)" fillOpacity={0.2} />
      </AreaChart>
    </ChartContainer>
  )
}`

const TEXT_EDITOR_TS = `import { Hono } from "hono"
import { auth } from "./auth"

const app = new Hono()

// Health check endpoint
app.get("/api/v1/health", (c) => {
  return c.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

export default app`

const TEXT_EDITOR_JSON = `{
  "name": "@celestia-project/starter",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck"
  },
  "dependencies": {
    "@celestia-project/ui": "workspace:*",
    "better-auth": "^1.6.25",
    "hono": "^4.6.14",
    "next": "16.2.6"
  }
}`

const TEXT_EDITOR_MD = `# Celestia Starter Architecture

The decoupled monorepo consists of:

- **apps/web**: Next.js 16 frontend with client auth.
- **apps/api**: Hono backend with Better Auth server & Drizzle ORM.
- **packages/ui**: Base UI + Tailwind v4 primitives.`

const TEXT_EDITOR_USAGE_CODE = `import * as React from "react"
import { TextEditor } from "@celestia-project/ui"

export function CodeEditorDemo() {
  const [code, setCode] = React.useState("const greeting: string = \\"Hello Celestia!\\"")

  return (
    <TextEditor
      value={code}
      onChange={(val) => setCode(val ?? "")}
      language="typescript"
      theme="dark"
      height={220}
      detectLinks
    />
  )
}`

export function SurfacesSection() {
  const [editorTab, setEditorTab] = React.useState<"ts" | "json" | "md">("ts")
  const [tsCode, setTsCode] = React.useState(TEXT_EDITOR_TS)
  const [jsonCode, setJsonCode] = React.useState(TEXT_EDITOR_JSON)
  const [mdCode, setMdCode] = React.useState(TEXT_EDITOR_MD)
  const { resolvedTheme } = useTheme()

  const currentCode = editorTab === "ts" ? tsCode : editorTab === "json" ? jsonCode : mdCode
  const currentLang = editorTab === "ts" ? "typescript" : editorTab === "json" ? "json" : "markdown"
  const currentFile = editorTab === "ts" ? "server.ts" : editorTab === "json" ? "package.json" : "README.md"

  const handleEditorChange = (val: string | undefined) => {
    const text = val ?? ""
    if (editorTab === "ts") setTsCode(text)
    else if (editorTab === "json") setJsonCode(text)
    else setMdCode(text)
  }

  return (
    <div id="surfaces" className="flex flex-col gap-6 pt-6 pb-16">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Surfaces & Rich Media
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          5 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Resizable Panels */}
        <ShowcaseCard
          id="resizable"
          title="Resizable Panels"
          category="Surfaces"
          description="Accessible resizable panel groups and layout splitters with drag handles."
          docsSlug="resizable"
          importSnippet={`import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@celestia-project/ui"`}
          codeExample={RESIZABLE_CODE}
        >
          <div className="h-36 w-full max-w-sm rounded-lg border border-border overflow-hidden">
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel defaultSize={40} minSize={25}>
                <div className="flex h-full items-center justify-center p-3 text-xs font-mono text-muted-foreground bg-muted/20">
                  Sidebar (40%)
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="flex h-full items-center justify-center p-3 text-xs font-mono text-muted-foreground">
                  Editor (60%)
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ShowcaseCard>

        {/* 2. Scroll Area */}
        <ShowcaseCard
          id="scroll-area"
          title="Scroll Area"
          category="Surfaces"
          description="Augments native scroll functionality for custom cross-browser styled scrollbars."
          docsSlug="scroll-area"
          importSnippet={`import { ScrollArea } from "@celestia-project/ui"`}
          codeExample={SCROLL_AREA_CODE}
        >
          <ScrollArea className="h-36 w-full max-w-sm rounded-lg border border-border p-3">
            <h4 className="mb-2 text-xs font-medium leading-none">Changelog & Milestones</h4>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/40 py-1">
                  <span>Commit #{1040 + i}: Refactor base UI token</span>
                  <span className="font-mono text-[10px]">v1.{i}.0</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </ShowcaseCard>

        {/* 3. Carousel */}
        <ShowcaseCard
          id="carousel"
          title="Carousel"
          category="Surfaces"
          description="A fluid motion carousel component with motion-reduced controls built on Embla."
          docsSlug="carousel"
          importSnippet={`import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@celestia-project/ui"`}
          codeExample={CAROUSEL_CODE}
        >
          <div className="w-full max-w-xs px-8">
            <Carousel className="w-full">
              <CarouselContent>
                {["Next.js 16 App Router", "Hono Backend API", "Better Auth Server", "Drizzle ORM"].map((item, index) => (
                  <CarouselItem key={index}>
                    <Card className="border border-border/80 bg-card/60">
                      <CardContent className="flex aspect-video items-center justify-center p-4">
                        <div className="flex flex-col items-center gap-1 text-center">
                          <Badge variant="outline" className="text-[10px]">Feature #{index + 1}</Badge>
                          <span className="text-xs font-medium text-foreground">{item}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </ShowcaseCard>

        {/* 4. Chart Container */}
        <ShowcaseCard
          id="chart"
          title="Chart Container"
          category="Surfaces"
          description="Chart container wrapper configuring responsive scales, CSS variable colors, and custom tooltips."
          docsSlug="chart"
          importSnippet={`import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@celestia-project/ui"`}
          codeExample={CHART_CODE}
        >
          <div className="w-full max-w-sm">
            <ChartContainer config={CHART_CONFIG} className="h-36 w-full">
              <AreaChart data={SAMPLE_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--color-requests)"
                  fill="var(--color-requests)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </ShowcaseCard>

        {/* 5. Text & Code Editor (Interactive CodeMirror Playground) */}
        <ShowcaseCard
          id="text-editor"
          title="Text & Code Editor"
          category="Surfaces"
          description="Full-featured CodeMirror editor supporting live typing, syntax highlighting, line wrapping, and URL detection."
          docsSlug="other-components"
          importSnippet={`import { TextEditor } from "@celestia-project/ui"`}
          codeExample={TEXT_EDITOR_USAGE_CODE}
          className="md:col-span-2"
        >
          <div className="w-full max-w-2xl rounded-lg border border-border overflow-hidden bg-background shadow-xs">
            {/* Playground Toolbar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-2">
                <CodeIcon className="size-4 text-primary" />
                <div className="flex items-center gap-1">
                  <Button
                    variant={editorTab === "ts" ? "secondary" : "ghost"}
                    size="xs"
                    onClick={() => setEditorTab("ts")}
                    className="h-6 text-[11px] font-mono"
                  >
                    server.ts
                  </Button>
                  <Button
                    variant={editorTab === "json" ? "secondary" : "ghost"}
                    size="xs"
                    onClick={() => setEditorTab("json")}
                    className="h-6 text-[11px] font-mono"
                  >
                    package.json
                  </Button>
                  <Button
                    variant={editorTab === "md" ? "secondary" : "ghost"}
                    size="xs"
                    onClick={() => setEditorTab("md")}
                    className="h-6 text-[11px] font-mono"
                  >
                    README.md
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[9px] uppercase px-1.5 py-0">
                {currentLang} • Live Editable
              </Badge>
            </div>

            {/* Interactive CodeMirror TextEditor */}
            <TextEditor
              value={currentCode}
              onChange={handleEditorChange}
              language={currentLang}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              height={180}
              detectLinks
              className="w-full text-xs font-mono"
            />
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}
