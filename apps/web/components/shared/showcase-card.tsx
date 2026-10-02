"use client"

import * as React from "react"
import {
  CopyIcon,
  CheckIcon,
  ArrowSquareOutIcon,
  CodeIcon,
  EyeIcon,
  ArrowsOutSimpleIcon,
  DesktopIcon,
  DeviceTabletIcon,
  DeviceMobileIcon,
  XIcon,
} from "@phosphor-icons/react"
import {
  Badge,
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@celestia-project/ui"
import { CodeBlock } from "@/components/shared/code-block"
import { toast } from "@celestia-project/ui/primitive/sonner"
import { cn } from "@celestia-project/ui/lib/utils"

export interface ShowcaseCardProps {
  id: string
  title: string
  description: string
  category: string
  importSnippet?: string
  codeExample?: string
  docsSlug?: string
  className?: string
  children: React.ReactNode
}

export function ShowcaseCard({
  id,
  title,
  description,
  category,
  importSnippet,
  codeExample,
  docsSlug,
  className,
  children,
}: ShowcaseCardProps) {
  const [activeTab, setActiveTab] = React.useState("preview")
  const [modalActiveTab, setModalActiveTab] = React.useState("preview")
  const [viewport, setViewport] = React.useState("desktop")
  const [copied, setCopied] = React.useState(false)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const defaultSnippet = `import { ${title.replace(/\s+/g, "")} } from "@celestia-project/ui"`
  const fullCode =
    codeExample ||
    `import * as React from "react"
${importSnippet || defaultSnippet}

export function ${title.replace(/[^a-zA-Z0-9]/g, "")}Demo() {
  return (
    <${title.replace(/\s+/g, "")}>
      ${title} Example
    </${title.replace(/\s+/g, "")}>
  )
}`

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`Copied ${label} for ${title}`)
    setTimeout(() => setCopied(false), 2000)
  }

  const docsUrl = docsSlug ? `/docs/components/${docsSlug}` : `/docs/components`

  return (
    <section
      id={id}
      data-category={category}
      data-title={title.toLowerCase()}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/70 bg-card text-card-foreground shadow-xs transition-all hover:border-border hover:shadow-md",
        className
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {title}
              </h3>
              <Badge
                variant="secondary"
                className="bg-muted px-1.5 py-0 font-mono text-[10px] tracking-wider text-muted-foreground uppercase"
              >
                {category}
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {/* View Switcher Tabs & Actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Native Celestia Tabs [Preview | Code] */}
            <TabsList className="h-8">
              <TabsTrigger value="preview" className="gap-1.5 text-xs">
                <EyeIcon className="size-3.5" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1.5 text-xs">
                <CodeIcon className="size-3.5" />
                <span>Code</span>
              </TabsTrigger>
            </TabsList>

            {/* Copy Full Code Action */}
            <Button
              variant="outline"
              onClick={() => handleCopy(fullCode, "TypeScript example")}
              className="gap-1 text-[11px] text-muted-foreground transition-transform hover:text-foreground active:scale-97"
              title="Copy TypeScript code example"
            >
              {copied ? (
                <CheckIcon className="size-3.5 text-success" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied" : "Copy"}
              </span>
            </Button>

            {/* Expand to Wide Modal View */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-muted-foreground transition-transform hover:text-foreground active:scale-97"
                    title="Expand to wide canvas view"
                  >
                    <ArrowsOutSimpleIcon className="size-3.5" />
                  </Button>
                }
              />

              <DialogContent
                showCloseButton={false}
                className="flex h-[88vh] w-[95vw] max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-2xl sm:max-w-6xl"
              >
                <Tabs
                  value={modalActiveTab}
                  onValueChange={setModalActiveTab}
                  className="flex h-full flex-col"
                >
                  {/* Modal Header */}
                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-base font-bold text-foreground">
                          {title}
                        </DialogTitle>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] uppercase"
                        >
                          {category}
                        </Badge>
                      </div>
                      <DialogDescription className="text-xs text-muted-foreground">
                        {description}
                      </DialogDescription>
                    </div>

                    {/* Modal Controls */}
                    <div className="flex items-center gap-2">
                      {/* [Preview | Code] Tabs */}
                      <TabsList className="h-8">
                        <TabsTrigger
                          value="preview"
                          className="gap-1.5 text-xs"
                        >
                          <EyeIcon className="size-3.5" />
                          <span>Preview</span>
                        </TabsTrigger>
                        <TabsTrigger value="code" className="gap-1.5 text-xs">
                          <CodeIcon className="size-3.5" />
                          <span>Code</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Responsive Viewport Switcher (Only visible in Preview tab) */}
                      {modalActiveTab === "preview" && (
                        <Tabs
                          value={viewport}
                          onValueChange={setViewport}
                          className="hidden sm:inline-flex"
                        >
                          <TabsList className="h-8">
                            <TabsTrigger
                              value="desktop"
                              className="gap-1 px-2 text-xs"
                              title="Desktop (100%)"
                            >
                              <DesktopIcon className="size-3.5" />
                              <span className="text-[11px]">100%</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="tablet"
                              className="gap-1 px-2 text-xs"
                              title="Tablet (768px)"
                            >
                              <DeviceTabletIcon className="size-3.5" />
                              <span className="text-[11px]">768px</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="mobile"
                              className="gap-1 px-2 text-xs"
                              title="Mobile (375px)"
                            >
                              <DeviceMobileIcon className="size-3.5" />
                              <span className="text-[11px]">375px</span>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}

                      {/* Copy Code */}
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleCopy(fullCode, "TypeScript example")
                        }
                        className="gap-1 text-[11px] transition-transform active:scale-97"
                      >
                        {copied ? (
                          <CheckIcon className="size-3.5 text-success" />
                        ) : (
                          <CopyIcon className="size-3.5" />
                        )}
                        <span className="hidden sm:inline">Copy Code</span>
                      </Button>

                      {/* Docs Link */}
                      <a href={docsUrl}>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="transition-transform active:scale-97"
                        >
                          <ArrowSquareOutIcon className="size-3.5" />
                        </Button>
                      </a>

                      {/* Close Dialog Button */}
                      <DialogClose
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="transition-transform active:scale-97"
                          >
                            <XIcon className="size-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="relative flex flex-1 flex-col overflow-hidden bg-background/50">
                    <TabsContent
                      value="preview"
                      className="flex h-full w-full flex-1 items-center justify-center overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/20 via-background to-background p-4 sm:p-8"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-xl p-6 transition-all duration-slow",
                          viewport === "desktop" && "w-full",
                          viewport === "tablet" &&
                            "w-[768px] max-w-full border border-dashed border-border/80 bg-card/40 shadow-sm",
                          viewport === "mobile" &&
                            "min-h-[400px] w-[375px] max-w-full rounded-2xl border-2 border-border/80 bg-card shadow-lg"
                        )}
                      >
                        {children}
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="code"
                      className="flex h-full flex-1 flex-col overflow-hidden"
                    >
                      <CodeBlock
                        code={fullCode}
                        language="tsx"
                        title={`${title.toLowerCase().replace(/\s+/g, "-")}.tsx`}
                        badge="TypeScript / React 19"
                        showCopy={false}
                        className="my-0 flex h-full flex-col rounded-none border-0 bg-transparent shadow-none"
                        preClassName="flex-1 max-h-none h-full bg-background/70"
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* Docs Link */}
            <a
              href={docsUrl}
              className="inline-flex"
              title={`View ${title} documentation`}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground transition-transform hover:text-foreground active:scale-97"
              >
                <ArrowSquareOutIcon className="size-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Main Card Body */}
        <TabsContent
          value="preview"
          className="flex min-h-[160px] flex-1 items-center justify-center overflow-x-auto rounded-b-xl bg-background/40 p-4 sm:p-6"
        >
          {children}
        </TabsContent>

        <TabsContent
          value="code"
          className="relative flex flex-1 flex-col overflow-hidden rounded-b-xl bg-background"
        >
          <CodeBlock
            code={fullCode}
            language="tsx"
            title={`${title.toLowerCase().replace(/\s+/g, "-")}.tsx`}
            badge="TypeScript / JSX"
            showCopy={false}
            height={280}
            className="my-0 rounded-none border-0 bg-transparent shadow-none"
            preClassName="bg-background/70"
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
