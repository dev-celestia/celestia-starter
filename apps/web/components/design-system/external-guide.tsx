"use client"

import * as React from "react"
import {
  CopyIcon,
  CheckIcon,
  PackageIcon,
  CpuIcon,
  FileCodeIcon,
  SparkleIcon,
  LightningIcon,
} from "@phosphor-icons/react"
import { Badge, Button } from "@celestia-project/ui"

export function ExternalGuide() {
  const [activePm, setActivePm] = React.useState<"pnpm" | "npm" | "yarn">("pnpm")
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedSection(id)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const installCmds = {
    pnpm: "pnpm add @celestia-project/ui @phosphor-icons/react @base-ui/react",
    npm: "npm install @celestia-project/ui @phosphor-icons/react @base-ui/react",
    yarn: "yarn add @celestia-project/ui @phosphor-icons/react @base-ui/react",
  }

  return (
    <div className="space-y-8">
      {/* 1. Quick Install */}
      <div className="rounded-xl border border-border/80 bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <PackageIcon className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">1. Install Package & Dependencies</h3>
              <p className="text-xs text-muted-foreground">Add the UI library to your external Next.js or React repository</p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 p-1">
            <Button
              variant={activePm === "pnpm" ? "default" : "ghost"}
              size="xs"
              onClick={() => setActivePm("pnpm")}
            >
              pnpm
            </Button>
            <Button
              variant={activePm === "npm" ? "default" : "ghost"}
              size="xs"
              onClick={() => setActivePm("npm")}
            >
              npm
            </Button>
            <Button
              variant={activePm === "yarn" ? "default" : "ghost"}
              size="xs"
              onClick={() => setActivePm("yarn")}
            >
              yarn
            </Button>
          </div>
        </div>

        <div className="relative">
          <pre className="overflow-x-auto rounded-lg border border-border/80 bg-muted/70 p-3.5 font-mono text-xs text-foreground">
            {installCmds[activePm]}
          </pre>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => copyCode(installCmds[activePm], "install")}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
          >
            {copiedSection === "install" ? (
              <CheckIcon className="size-3.5 text-green-500" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* 2. Global CSS & Theme Setup */}
      <div className="rounded-xl border border-border/80 bg-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <FileCodeIcon className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">2. Import Global Styles & Design Tokens</h3>
            <p className="text-xs text-muted-foreground">Include the core stylesheet in your layout or root entry point</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            In your root layout (e.g. <code className="font-mono text-primary font-medium">app/layout.tsx</code> for Next.js or <code className="font-mono text-primary font-medium">src/main.tsx</code> for Vite):
          </p>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-border/80 bg-muted/70 p-3.5 font-mono text-xs text-foreground leading-relaxed">
{`// app/layout.tsx
import "@celestia-project/ui/globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}`}
            </pre>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() =>
                copyCode(
                  `import "@celestia-project/ui/globals.css"`,
                  "import-css"
                )
              }
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            >
              {copiedSection === "import-css" ? (
                <CheckIcon className="size-3.5 text-green-500" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Component Usage Example */}
      <div className="rounded-xl border border-border/80 bg-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <SparkleIcon className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">3. Consume Components in Your Views</h3>
            <p className="text-xs text-muted-foreground">Import typed primitives with full tree-shaking support</p>
          </div>
        </div>

        <div className="relative">
          <pre className="overflow-x-auto rounded-lg border border-border/80 bg-muted/70 p-3.5 font-mono text-xs text-foreground leading-relaxed">
{`import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@celestia-project/ui"
import { SparkleIcon } from "@phosphor-icons/react"

export function DashboardCard() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Welcome to Celestia</CardTitle>
          <Badge variant="outline" className="gap-1 text-primary">
            <SparkleIcon className="size-3" weight="fill" /> Pro
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ready-to-use production UI connected seamlessly to your design tokens.
        </p>
        <div className="flex gap-2">
          <Button variant="default">Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </CardContent>
    </Card>
  )
}`}
          </pre>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() =>
              copyCode(
                `import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@celestia-project/ui"`,
                "import-comp"
              )
            }
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
          >
            {copiedSection === "import-comp" ? (
              <CheckIcon className="size-3.5 text-green-500" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* 4. Deep Imports & Tree-shaking */}
      <div className="rounded-xl border border-border/80 bg-card p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <LightningIcon className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Deep Imports for Granular Bundling</h3>
            <p className="text-xs text-muted-foreground">Direct subpath exports for micro-frontends and minimal bundle budgets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
            <span className="text-muted-foreground font-sans block mb-1 font-semibold text-[11px]">Component Primitives:</span>
            <code className="text-primary truncate block">import &#123; Button &#125; from &quot;@celestia-project/ui/components/button&quot;</code>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
            <span className="text-muted-foreground font-sans block mb-1 font-semibold text-[11px]">Utility Classnames:</span>
            <code className="text-primary truncate block">import &#123; cn &#125; from &quot;@celestia-project/ui/lib/utils&quot;</code>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
            <span className="text-muted-foreground font-sans block mb-1 font-semibold text-[11px]">Hooks & Breakpoints:</span>
            <code className="text-primary truncate block">import &#123; useIsMobile &#125; from &quot;@celestia-project/ui/hooks/use-mobile&quot;</code>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
            <span className="text-muted-foreground font-sans block mb-1 font-semibold text-[11px]">Global Stylesheet:</span>
            <code className="text-primary truncate block">import &quot;@celestia-project/ui/globals.css&quot;</code>
          </div>
        </div>
      </div>
    </div>
  )
}
