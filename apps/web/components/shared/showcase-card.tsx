"use client"

import * as React from "react"
import { useTheme } from "next-themes"
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
  TextEditor,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@celestia-project/ui"
import { toast } from "sonner"
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
  const [activeTab, setActiveTab] = React.useState<"preview" | "code">("preview")
  const [modalActiveTab, setModalActiveTab] = React.useState<"preview" | "code">("preview")
  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">("desktop")
  const [copied, setCopied] = React.useState(false)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const { resolvedTheme } = useTheme()

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

  const docsUrl = docsSlug
    ? `/docs/components/${docsSlug}`
    : `/docs/components`

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
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
              {title}
            </h3>
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0 bg-muted text-muted-foreground"
            >
              {category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Segmented Control [Preview | Code] */}
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5 border border-border/50">
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer active:scale-97",
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <EyeIcon className="size-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer active:scale-97",
                activeTab === "code"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CodeIcon className="size-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Copy Full Code Action */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleCopy(fullCode, "TypeScript example")}
            className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-border/40 active:scale-97 transition-transform"
            title="Copy TypeScript code example"
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-green-500" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>

          {/* Expand to Wide Modal View */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground border border-border/40 active:scale-97 transition-transform"
                  title="Expand to wide canvas view"
                >
                  <ArrowsOutSimpleIcon className="size-3.5" />
                </Button>
              }
            />

            <DialogContent
              showCloseButton={false}
              className="max-w-6xl w-[95vw] h-[88vh] p-0 flex flex-col rounded-2xl overflow-hidden sm:max-w-6xl bg-card text-card-foreground border border-border shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3.5 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base font-bold text-foreground">
                      {title}
                    </DialogTitle>
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase">
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
                  <div className="flex items-center rounded-lg bg-muted/80 p-0.5 border border-border/60">
                    <button
                      onClick={() => setModalActiveTab("preview")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer active:scale-97",
                        modalActiveTab === "preview"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <EyeIcon className="size-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => setModalActiveTab("code")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer active:scale-97",
                        modalActiveTab === "code"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <CodeIcon className="size-3.5" />
                      <span>Code</span>
                    </button>
                  </div>

                  {/* Responsive Viewport Switcher (Only visible in Preview tab) */}
                  {modalActiveTab === "preview" && (
                    <div className="hidden sm:flex items-center rounded-lg bg-muted/80 p-0.5 border border-border/60">
                      <button
                        onClick={() => setViewport("desktop")}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all cursor-pointer active:scale-97",
                          viewport === "desktop"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Desktop (100%)"
                      >
                        <DesktopIcon className="size-3.5" />
                        <span className="text-[11px]">100%</span>
                      </button>
                      <button
                        onClick={() => setViewport("tablet")}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all cursor-pointer active:scale-97",
                          viewport === "tablet"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Tablet (768px)"
                      >
                        <DeviceTabletIcon className="size-3.5" />
                        <span className="text-[11px]">768px</span>
                      </button>
                      <button
                        onClick={() => setViewport("mobile")}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all cursor-pointer active:scale-97",
                          viewport === "mobile"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Mobile (375px)"
                      >
                        <DeviceMobileIcon className="size-3.5" />
                        <span className="text-[11px]">375px</span>
                      </button>
                    </div>
                  )}

                  {/* Copy Code */}
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleCopy(fullCode, "TypeScript example")}
                    className="h-7 gap-1 text-[11px] active:scale-97 transition-transform"
                  >
                    {copied ? <CheckIcon className="size-3.5 text-green-500" /> : <CopyIcon className="size-3.5" />}
                    <span className="hidden sm:inline">Copy Code</span>
                  </Button>

                  {/* Docs Link */}
                  <a href={docsUrl}>
                    <Button variant="outline" size="icon-xs" className="h-7 w-7 active:scale-97 transition-transform">
                      <ArrowSquareOutIcon className="size-3.5" />
                    </Button>
                  </a>

                  {/* Close Dialog Button */}
                  <DialogClose
                    render={
                      <Button variant="ghost" size="icon-xs" className="h-7 w-7 active:scale-97 transition-transform">
                        <XIcon className="size-4" />
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden relative flex flex-col bg-background/50">
                {modalActiveTab === "preview" ? (
                  <div className="flex-1 w-full overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/20 via-background to-background">
                    <div
                      className={cn(
                        "transition-all duration-300 flex items-center justify-center p-6 rounded-xl",
                        viewport === "desktop" && "w-full",
                        viewport === "tablet" && "w-[768px] max-w-full border border-dashed border-border/80 bg-card/40 shadow-sm",
                        viewport === "mobile" && "w-[375px] max-w-full border-2 border-border/80 rounded-2xl bg-card shadow-lg min-h-[400px]"
                      )}
                    >
                      {children}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border/40 bg-muted/40 px-4 py-2 text-xs">
                      <span className="font-mono font-medium text-foreground">
                        {title.toLowerCase().replace(/\s+/g, "-")}.tsx
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        TypeScript / React 19
                      </Badge>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <TextEditor
                        value={fullCode}
                        language="tsx"
                        theme={resolvedTheme === "dark" ? "dark" : "light"}
                        height="100%"
                        options={{ readOnly: true }}
                        className="w-full h-full text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
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
              size="icon-xs"
              className="h-7 w-7 text-muted-foreground hover:text-foreground active:scale-97 transition-transform"
            >
              <ArrowSquareOutIcon className="size-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Main Card Body */}
      {activeTab === "preview" ? (
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 bg-background/40 rounded-b-xl overflow-x-auto min-h-[160px]">
          {children}
        </div>
      ) : (
        <div className="relative flex flex-col flex-1 rounded-b-xl overflow-hidden bg-background">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3.5 py-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-muted-foreground">
                {title.toLowerCase().replace(/\s+/g, "-")}.tsx
              </span>
            </div>
            <Badge variant="outline" className="font-mono text-[9px] uppercase px-1.5 py-0">
              TypeScript / JSX
            </Badge>
          </div>

          {/* Full CodeMirror TextEditor */}
          <div className="flex-1 w-full overflow-hidden">
            <TextEditor
              value={fullCode}
              language="tsx"
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              height={280}
              options={{ readOnly: true }}
              className="w-full text-xs font-mono"
            />
          </div>
        </div>
      )}
    </section>
  )
}
