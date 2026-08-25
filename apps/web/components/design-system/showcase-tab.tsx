"use client"

import * as React from "react"
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react"
import { Badge, Button, Card, CardContent } from "@celestia-project/ui"
import { ComponentsSidebar, CATEGORIES } from "@/components/showcase/components-sidebar"
import { ButtonsSection } from "@/components/showcase/sections/buttons-section"
import { InputsSection } from "@/components/showcase/sections/inputs-section"
import { DataDisplaySection } from "@/components/showcase/sections/data-display-section"
import { FeedbackSection } from "@/components/showcase/sections/feedback-section"
import { NavigationSection } from "@/components/showcase/sections/navigation-section"
import { ChatAiSection } from "@/components/showcase/sections/chat-ai-section"
import { SurfacesSection } from "@/components/showcase/sections/surfaces-section"
import { useDesignSystem } from "./hooks/use-design-system"

export function ShowcaseTab() {
  const {
    searchQuery,
    resetSearch,
    normalizedQuery,
    activeCategory,
    setActiveCategory,
    scrollToCategory,
  } = useDesignSystem()

  return (
    <div className="pt-8">
      {/* Mobile Category Navigation Pills */}
      <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-3 mb-4 lg:hidden scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <Badge
              key={cat.id}
              variant={isActive ? "default" : "secondary"}
              onClick={() => scrollToCategory(cat.id)}
              className="shrink-0 cursor-pointer text-xs py-1 px-3"
            >
              {cat.name}
            </Badge>
          )
        })}
      </div>

      <div className="flex gap-8">
        {/* Sticky Left Sidebar */}
        <ComponentsSidebar
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Main Showcase Feed */}
        <div className="flex-1 min-w-0 flex flex-col gap-10">
          {/* Search banner if searching */}
          {searchQuery && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center justify-between p-3.5 text-xs">
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="size-4 text-primary" />
                  <span>
                    Filtering components matching: <strong className="text-foreground">&quot;{searchQuery}&quot;</strong>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={resetSearch}
                  className="gap-1 text-primary hover:text-primary/80"
                >
                  <XIcon className="size-3" />
                  <span>Reset filter</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Show sections based on search */}
          {(!normalizedQuery || "buttons button toggle ripple group".includes(normalizedQuery)) && (
            <ButtonsSection />
          )}

          {(!normalizedQuery || "inputs input textarea checkbox radio switch slider select combobox otp field form url native-select".includes(normalizedQuery)) && (
            <InputsSection />
          )}

          {(!normalizedQuery || "data display card article badge avatar table empty item marker kbd skeleton aspect ratio separator".includes(normalizedQuery)) && (
            <DataDisplaySection />
          )}

          {(!normalizedQuery || "feedback alert dialog sheet drawer popover tooltip hover card progress spinner sonner toast".includes(normalizedQuery)) && (
            <FeedbackSection />
          )}

          {(!normalizedQuery || "navigation tabs tab bar breadcrumb pagination accordion collapsible dropdown context menu menubar command".includes(normalizedQuery)) && (
            <NavigationSection />
          )}

          {(!normalizedQuery || "chat ai message bubble attachment input prompt reasoning tool model plan task suggestion sources citation audio file-tree confirmation context scroller area".includes(normalizedQuery)) && (
            <ChatAiSection />
          )}

          {(!normalizedQuery || "surfaces resizable scroll area carousel text code editor chart".includes(normalizedQuery)) && (
            <SurfacesSection />
          )}
        </div>
      </div>
    </div>
  )
}
