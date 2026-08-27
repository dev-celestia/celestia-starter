"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function AutoDarkTheme() {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    setTheme("dark")
    try {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } catch {
      // Ignore error if localStorage is blocked
    }
  }, [setTheme])

  return null
}
