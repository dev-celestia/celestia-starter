"use client"

import * as React from "react"

interface DesignSystemContextValue {
  searchQuery: string
  setSearchQuery: (query: string) => void
  resetSearch: () => void
  normalizedQuery: string
  activeCategory: string
  setActiveCategory: (category: string) => void
  scrollToCategory: (categoryId: string) => void
}

const DesignSystemContext = React.createContext<DesignSystemContextValue | null>(null)

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("buttons")

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
      searchQuery,
      setSearchQuery,
      resetSearch,
      normalizedQuery,
      activeCategory,
      setActiveCategory,
      scrollToCategory,
    }),
    [searchQuery, resetSearch, normalizedQuery, activeCategory, scrollToCategory]
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
