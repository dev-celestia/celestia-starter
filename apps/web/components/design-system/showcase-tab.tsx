"use client"

import * as React from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
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
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => scrollToCategory(cat.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
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
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <MagnifyingGlassIcon className="size-4 text-primary" />
                <span>
                  Filtering components matching: <strong className="text-foreground">"{searchQuery}"</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={resetSearch}
                className="text-xs text-primary underline hover:opacity-80 cursor-pointer"
              >
                Reset filter
              </button>
            </div>
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
