"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { CATEGORIES } from "@/components/showcase/components-sidebar"

export type SectionTab = "components" | "tokens" | "guide" | "principles"

const VALID_TABS: SectionTab[] = ["components", "tokens", "guide", "principles"]

interface DesignSystemContextValue {
  activeSection: SectionTab
  setActiveSection: (tab: SectionTab) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleSearchChange: (query: string) => void
  resetSearch: () => void
  normalizedQuery: string
  activeCategory: string
  setActiveCategory: (category: string) => void
  scrollToCategory: (categoryId: string) => void
}

const DesignSystemContext = React.createContext<DesignSystemContextValue | null>(null)

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") as SectionTab

  const [activeSection, setActiveSection] = React.useState<SectionTab>(
    VALID_TABS.includes(initialTab) ? initialTab : "components"
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("buttons")


  // Sync tab with URL search parameter if changed externally
  React.useEffect(() => {
    const tab = searchParams.get("tab") as SectionTab
    if (tab && VALID_TABS.includes(tab)) {
      setActiveSection(tab)
    }
  }, [searchParams])

  // When user searches, switch to components tab automatically if currently on another tab
  const handleSearchChange = React.useCallback(
    (query: string) => {
      setSearchQuery(query)
      if (query.trim() && activeSection !== "components") {
        setActiveSection("components")
      }
    },
    [activeSection]
  )

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
      activeSection,
      setActiveSection,
      searchQuery,
      setSearchQuery,
      handleSearchChange,
      resetSearch,
      normalizedQuery,
      activeCategory,
      setActiveCategory,
      scrollToCategory,
    }),
    [
      activeSection,
      searchQuery,
      handleSearchChange,
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
