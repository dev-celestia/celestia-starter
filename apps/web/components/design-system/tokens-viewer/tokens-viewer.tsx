"use client"

import * as React from "react"
import {
  PaletteIcon,
  TextTIcon,
  BoundingBoxIcon,
  DropIcon,
  CodeIcon,
} from "@phosphor-icons/react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@celestia-project/ui"
import { ColorTokensPanel } from "./color-tokens-panel"
import { TypographyTokensPanel } from "./typography-tokens-panel"
import { RadiusTokensPanel } from "./radius-tokens-panel"
import { ShadowTokensPanel } from "./shadow-tokens-panel"
import { ExportTokensPanel } from "./export-tokens-panel"

export function TokensViewer() {
  const [activeTab, setActiveTab] = React.useState("colors")

  return (
    <div className="space-y-6">
      {/* Token Tabs Strip */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full overflow-hidden">
        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 pb-2">
          <TabsList className="inline-flex w-max flex-nowrap h-9 p-1 gap-1">
            <TabsTrigger value="colors" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <PaletteIcon className="size-4 shrink-0" />
              <span>Colors & Semantic Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <TextTIcon className="size-4 shrink-0" />
              <span>Typography Scale</span>
            </TabsTrigger>
            <TabsTrigger value="radius" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <BoundingBoxIcon className="size-4 shrink-0" />
              <span>Radius & Spacing</span>
            </TabsTrigger>
            <TabsTrigger value="shadows" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <DropIcon className="size-4 shrink-0" />
              <span>Elevation & Shadows</span>
            </TabsTrigger>
            <TabsTrigger value="exporter" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <CodeIcon className="size-4 shrink-0" />
              <span>Export Tokens</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Colors Tab */}
        <TabsContent value="colors">
          <ColorTokensPanel />
        </TabsContent>

        {/* 2. Typography Tab */}
        <TabsContent value="typography">
          <TypographyTokensPanel />
        </TabsContent>

        {/* 3. Radius & Spacing Tab */}
        <TabsContent value="radius">
          <RadiusTokensPanel />
        </TabsContent>

        {/* 4. Shadows & Elevation Tab */}
        <TabsContent value="shadows">
          <ShadowTokensPanel />
        </TabsContent>

        {/* 5. Exporter Tab */}
        <TabsContent value="exporter">
          <ExportTokensPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
