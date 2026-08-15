"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  GithubLogoIcon,
  BookOpenIcon,
  HouseIcon,
  SparkleIcon,
  CommandIcon,
} from "@phosphor-icons/react"
import { Button, Badge, Input, InputGroup, InputGroupAddon } from "@celestia-project/ui"
import { LogoMark } from "@/components/landing/nav-bar"

interface ComponentsHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  totalComponents: number
}

export function ComponentsHeader({
  searchQuery,
  setSearchQuery,
  totalComponents,
}: ComponentsHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand & Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <LogoMark className="size-6" />
            <span className="font-semibold tracking-tight text-foreground text-sm sm:text-base">
              Celestia UI
            </span>
          </Link>
          <span className="text-muted-foreground/40 font-mono text-sm">/</span>
          <Badge variant="outline" className="gap-1 font-mono text-xs font-normal border-primary/20 bg-primary/5 text-primary">
            <SparkleIcon className="size-3 text-primary" weight="fill" />
            Showcase
          </Badge>
        </div>

        {/* Live Search Bar */}
        <div className="flex flex-1 max-w-md items-center mx-2 sm:mx-6">
          <div className="relative w-full">
            <InputGroup className="h-9 w-full bg-muted/40 border-border/80 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/40 rounded-lg">
              <InputGroupAddon>
                <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <Input
                type="text"
                placeholder="Search 70+ components (e.g. Button, Dialog, Chart)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mr-2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted text-[10px]"
                >
                  Clear
                </button>
              )}
            </InputGroup>
          </div>
        </div>

        {/* Right Actions: Links & Theme */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="https://dev-celestia.github.io/celestia-starter/docs/components"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex"
          >
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <BookOpenIcon className="size-4" />
              <span>Docs</span>
            </Button>
          </Link>

          <Link
            href="https://github.com/celestia-realm/celestia-starter"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex"
          >
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <GithubLogoIcon className="size-4" />
              <span>GitHub</span>
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <HouseIcon className="size-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </Button>
          </Link>

          {mounted && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              title="Toggle theme (Hotkey: D)"
              className="text-muted-foreground hover:text-foreground"
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="size-4" />
              ) : (
                <MoonIcon className="size-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
