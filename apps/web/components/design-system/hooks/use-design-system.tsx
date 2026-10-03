"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

export type DesignSystemTab = "components" | "templates"

interface DesignSystemContextValue {
  activeTab: DesignSystemTab
  setActiveTab: (tab: DesignSystemTab) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  resetSearch: () => void
  normalizedQuery: string
  activeCategory: string
  setActiveCategory: (category: string) => void
  scrollToCategory: (categoryId: string) => void
}

const DesignSystemContext = React.createContext<DesignSystemContextValue | null>(null)

export function DesignSystemProvider({
  children,
  defaultTab = "components",
}: {
  children: React.ReactNode
  defaultTab?: DesignSystemTab
}) {
  const searchParams = useSearchParams()
  const tabFromQuery = searchParams.get("tab")
  const initialTab: DesignSystemTab =
    tabFromQuery === "templates" || tabFromQuery === "components"
      ? tabFromQuery
      : defaultTab

  const [activeTab, setActiveTabState] = React.useState<DesignSystemTab>(initialTab)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("buttons")

  // Sync tab state with URL query parameter
  React.useEffect(() => {
    const currentTab = searchParams.get("tab")
    if (currentTab === "templates" || currentTab === "components") {
      setActiveTabState(currentTab)
    }
  }, [searchParams])

  const setActiveTab = React.useCallback((tab: DesignSystemTab) => {
    setActiveTabState(tab)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (tab === "components") {
        url.searchParams.delete("tab")
      } else {
        url.searchParams.set("tab", tab)
      }
      window.history.replaceState(null, "", url.toString())
    }
  }, [])

  const resetSearch = React.useCallback(() => {
    setSearchQuery("")
  }, [])

  const scrollToCategory = React.useCallback((categoryId: string) => {
    setActiveCategory(categoryId)
    const el = document.getElementById(categoryId)
    if (el) {
      const yOffset = -90
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }, [])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const value = React.useMemo(
    () => ({
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      resetSearch,
      normalizedQuery,
      activeCategory,
      setActiveCategory,
      scrollToCategory,
    }),
    [
      activeTab,
      setActiveTab,
      searchQuery,
      resetSearch,
      normalizedQuery,
      activeCategory,
      scrollToCategory,
    ]
  )

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  )
}

export function useDesignSystem() {
  const context = React.useContext(DesignSystemContext)
  if (!context) {
    throw new Error("useDesignSystem must be used within a DesignSystemProvider")
  }
  return context
}
