"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  GithubLogoIcon,
  ListIcon,
  SparkleIcon,
  HouseIcon,
} from "@phosphor-icons/react"
import { Button, Badge } from "@celestia-project/ui"
import { LogoMark } from "@/components/landing/nav-bar"
import { SearchDialog } from "./search-dialog"

export interface DocsHeaderProps {
  onToggleMobileMenu?: () => void
}

export function DocsHeader({ onToggleMobileMenu }: DocsHeaderProps) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {onToggleMobileMenu && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onToggleMobileMenu}
                className="lg:hidden text-muted-foreground hover:text-foreground"
                aria-label="Toggle navigation menu"
              >
                <ListIcon className="size-5" />
              </Button>
            )}

            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
              <LogoMark className="size-6" />
              <span className="font-bold tracking-tight text-foreground text-sm sm:text-base">
                Celestia
              </span>
            </Link>

            <span className="text-muted-foreground/40 font-mono text-sm hidden sm:inline">/</span>

            <Link href="/docs">
              <Badge variant="outline" className="gap-1 font-mono text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                Docs
              </Badge>
            </Link>
          </div>

          {/* Center: Search Trigger */}
          <div className="flex flex-1 max-w-md items-center mx-2 sm:mx-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/70 hover:text-foreground cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2">
                <MagnifyingGlassIcon className="size-3.5 text-muted-foreground" />
                <span className="text-[12px]">Search docs & components...</span>
              </div>
              <kbd className="hidden sm:inline-block rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href="/components" className="hidden sm:inline-flex">
              <Button variant="ghost" size="xs" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground active:scale-97 transition-transform">
                <SparkleIcon className="size-3.5 text-primary" />
                <span>Showcase</span>
              </Button>
            </Link>

            <Link
              href="https://github.com/celestia-realm/celestia-starter"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex"
            >
              <Button variant="ghost" size="xs" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground active:scale-97 transition-transform">
                <GithubLogoIcon className="size-4" />
                <span>GitHub</span>
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" size="xs" className="gap-1.5 text-xs active:scale-97 transition-transform">
                <HouseIcon className="size-3.5" />
                <span className="hidden sm:inline">Landing</span>
              </Button>
            </Link>

            {mounted && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                title="Toggle theme"
                className="text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
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

      {/* Search Modal */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
