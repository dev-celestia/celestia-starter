"use client"

import * as React from "react"
import {
  CopyIcon,
  CheckIcon,
  PackageIcon,
  FileCodeIcon,
  SparkleIcon,
  LightningIcon,
} from "@phosphor-icons/react"
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TextEditor,
} from "@celestia-project/ui"
import { useTheme } from "next-themes"

const INSTALL_PNPM = `pnpm add @celestia-project/ui @phosphor-icons/react @base-ui/react`
const INSTALL_NPM = `npm install @celestia-project/ui @phosphor-icons/react @base-ui/react`
const INSTALL_YARN = `yarn add @celestia-project/ui @phosphor-icons/react @base-ui/react`

const QUICKSTART_CODE = `// app/layout.tsx (Next.js) or src/main.tsx (Vite)
import "@celestia-project/ui/globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}`

const SOURCE_DIRECTIVE_CODE = `/* src/styles/globals.css (Existing Tailwind v4 App) */
@import "tailwindcss";

/* 1. Point Tailwind v4 to scan @celestia-project/ui for utility classes */
@source "../../node_modules/@celestia-project/ui";
@source "../**";

@custom-variant dark (&:is(.dark *));

/* 2. Map shadcn & Celestia theme tokens to your CSS variables */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* Optional: Celestia UI tokens & motion */
  --color-bg: hsl(var(--bg, 0 0% 4%));
  --color-surface: hsl(var(--surface, 0 0% 8%));
  --color-text-primary: hsl(var(--text, 0 0% 96%));
  --color-fog: hsl(0 0% 53%);
  --color-stroke: hsl(var(--stroke, 0 0% 12%));
}`

const COMPONENT_USAGE_CODE = `import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@celestia-project/ui"
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
}`

const DEEP_IMPORTS_CODE = `// Granular subpath imports for maximum tree-shaking & minimal bundles
import { Button } from "@celestia-project/ui/components/button"
import { Card, CardHeader, CardTitle, CardContent } from "@celestia-project/ui/components/card"
import { Dialog, DialogTrigger, DialogContent } from "@celestia-project/ui/components/dialog"
import { useIsMobile } from "@celestia-project/ui/hooks/use-mobile"
import { cn } from "@celestia-project/ui/lib/utils"`

export function ExternalGuide() {
  const { resolvedTheme } = useTheme()
  const editorTheme = resolvedTheme === "light" ? "light" : "dark"

  const [activePm, setActivePm] = React.useState("pnpm")
  const [activeStyleOption, setActiveStyleOption] = React.useState("quickstart")
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedSection(id)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const installCmds: Record<string, string> = {
    pnpm: INSTALL_PNPM,
    npm: INSTALL_NPM,
    yarn: INSTALL_YARN,
  }

  return (
    <div className="space-y-8">
      {/* 1. Quick Install */}
      <Card>
        <Tabs value={activePm} onValueChange={(val) => setActivePm(val as string)}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <PackageIcon className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base">1. Install Package & Dependencies</CardTitle>
                <CardDescription className="text-xs">Add the UI library and base peer dependencies to your repository</CardDescription>
              </div>
            </div>

            <TabsList>
              <TabsTrigger value="pnpm">pnpm</TabsTrigger>
              <TabsTrigger value="npm">npm</TabsTrigger>
              <TabsTrigger value="yarn">yarn</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-0">
            {["pnpm", "npm", "yarn"].map((pm) => (
              <TabsContent key={pm} value={pm}>
                <div className="relative rounded-lg border border-border/80 overflow-hidden bg-background">
                  <TextEditor
                    value={installCmds[pm] ?? ""}
                    language="bash"
                    theme={editorTheme}
                    height={52}
                    disableValidation
                    options={{
                      readOnly: true,
                      lineNumbers: "off",
                      glyphMargin: false,
                      folding: false,
                      lineDecorationsWidth: 10,
                      padding: { top: 14, bottom: 14 },
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => copyCode(installCmds[pm] ?? "", `install-${pm}`)}
                    className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground"
                  >
                    {copiedSection === `install-${pm}` ? (
                      <CheckIcon className="size-3.5 text-green-500" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </CardContent>
        </Tabs>
      </Card>

      {/* 2. Global CSS & Theme Setup */}
      <Card>
        <Tabs value={activeStyleOption} onValueChange={(val) => setActiveStyleOption(val as string)}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileCodeIcon className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base">2. Styles & Tailwind v4 Configuration</CardTitle>
                <CardDescription className="text-xs">Choose between standalone quickstart or integrating with an existing Tailwind v4 app</CardDescription>
              </div>
            </div>

            <TabsList className="max-w-full overflow-x-auto shrink-0 flex-nowrap">
              <TabsTrigger value="quickstart" className="whitespace-nowrap">Option A: Quickstart</TabsTrigger>
              <TabsTrigger value="source" className="whitespace-nowrap">Option B: @source Directive</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            <TabsContent value="quickstart" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                <strong>Option A (Quickstart):</strong> Import the pre-built stylesheet in your root layout (<code className="font-mono text-primary font-medium">app/layout.tsx</code> or <code className="font-mono text-primary font-medium">src/main.tsx</code>). Includes all tokens, resets, and animations.
              </p>
              <div className="relative rounded-lg border border-border/80 overflow-hidden bg-background">
                <TextEditor
                  value={QUICKSTART_CODE}
                  language="typescript"
                  theme={editorTheme}
                  height={220}
                  disableValidation
                  options={{
                    readOnly: true,
                    lineNumbers: "on",
                    lineNumbersMinChars: 3,
                    folding: false,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => copyCode(QUICKSTART_CODE, "style-quickstart")}
                  className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground"
                >
                  {copiedSection === "style-quickstart" ? (
                    <CheckIcon className="size-3.5 text-green-500" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="source" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                <strong>Option B (Existing Tailwind v4 App):</strong> Use Tailwind v4&apos;s <code className="font-mono text-primary font-medium">@source</code> directive in your project&apos;s <code className="font-mono text-primary font-medium">globals.css</code> to scan the UI package without conflicting with your app&apos;s custom theme variables.
              </p>
              <div className="relative rounded-lg border border-border/80 overflow-hidden bg-background">
                <TextEditor
                  value={SOURCE_DIRECTIVE_CODE}
                  language="css"
                  theme={editorTheme}
                  height={340}
                  disableValidation
                  options={{
                    readOnly: true,
                    lineNumbers: "on",
                    lineNumbersMinChars: 3,
                    folding: false,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => copyCode(SOURCE_DIRECTIVE_CODE, "style-source")}
                  className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground"
                >
                  {copiedSection === "style-source" ? (
                    <CheckIcon className="size-3.5 text-green-500" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* 3. Component Usage Example */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <SparkleIcon className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base">3. Consume Components in Your Views</CardTitle>
              <CardDescription className="text-xs">Import typed primitives with full tree-shaking support</CardDescription>
            </div>
          </div>

          <Badge variant="secondary" className="font-mono text-[11px]">
            React 19 + TypeScript
          </Badge>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="relative rounded-lg border border-border/80 overflow-hidden bg-background">
            <TextEditor
              value={COMPONENT_USAGE_CODE}
              language="typescript"
              theme={editorTheme}
              height={360}
              disableValidation
              options={{
                readOnly: true,
                lineNumbers: "on",
                lineNumbersMinChars: 3,
                folding: false,
                padding: { top: 12, bottom: 12 },
              }}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => copyCode(COMPONENT_USAGE_CODE, "import-comp")}
              className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground"
            >
              {copiedSection === "import-comp" ? (
                <CheckIcon className="size-3.5 text-green-500" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4. Deep Imports & Tree-shaking */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <LightningIcon className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base">4. Deep Imports for Minimal Bundle Budgets</CardTitle>
              <CardDescription className="text-xs">Direct subpath exports for fine-grained tree-shaking and micro-frontends</CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-[11px]">
            Subpath Exports
          </Badge>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="relative rounded-lg border border-border/80 overflow-hidden bg-background">
            <TextEditor
              value={DEEP_IMPORTS_CODE}
              language="typescript"
              theme={editorTheme}
              height={160}
              disableValidation
              options={{
                readOnly: true,
                lineNumbers: "on",
                lineNumbersMinChars: 3,
                folding: false,
                padding: { top: 12, bottom: 12 },
              }}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => copyCode(DEEP_IMPORTS_CODE, "deep-imports")}
              className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground"
            >
              {copiedSection === "deep-imports" ? (
                <CheckIcon className="size-3.5 text-green-500" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
