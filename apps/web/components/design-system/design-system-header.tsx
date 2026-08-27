"use client"

import * as React from "react"
import { Header } from "@/components/shared/header"
import { useDesignSystem } from "./hooks/use-design-system"

export function DesignSystemHeader() {
  const { searchQuery, handleSearchChange } = useDesignSystem()

  return (
    <Header
      brandTitle="Celestia"
      badgeLabel="Design System"
      badgeHref="/design-system"
      searchQuery={searchQuery}
      setSearchQuery={handleSearchChange}
      searchPlaceholder="Search UI & AI components, tokens, guides..."
    />
  )
}
