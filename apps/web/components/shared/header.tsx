"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MagnifyingGlassIcon,
  GithubLogoIcon,
  ListIcon,
  XIcon,
  SparkleIcon,
  BookOpenIcon,
  HouseIcon,
  CaretRightIcon,
  TriangleDashedIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react"
import {
  Badge,
  Button,
  ButtonGroup,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { LogoMark } from "@/components/landing/nav-bar"
import { SearchDialog } from "@/components/docs/search-dialog"
import { ThemeCustomizer } from "@/components/shared/theme-customizer"

export interface HeaderProps {
  variant?: "docs" | "showcase"
  brandTitle?: string
  badgeLabel?: string
  badgeHref?: string
  onToggleMobileMenu?: () => void
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  searchPlaceholder?: string
  totalComponents?: number
  className?: string
  children?: React.ReactNode
}

export function Header({
  variant = "docs",
  brandTitle = "Celestia",
  badgeLabel,
  badgeHref,
  onToggleMobileMenu,
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
  totalComponents,
  className = "",
  children,
}: Readonly<HeaderProps>) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Auto-close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent background scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [mobileMenuOpen])

  // Keydown shortcuts: "/" for live search, "⌘K" for modal search, "Esc" to close menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false)
        }
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur()
        }
      }

      if (setSearchQuery) {
        if (
          e.key === "/" &&
          !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName) &&
          !(e.target as HTMLElement)?.isContentEditable
        ) {
          e.preventDefault()
          searchInputRef.current?.focus()
          searchInputRef.current?.select()
        }
      } else {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault()
          setSearchOpen((prev) => !prev)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setSearchQuery, mobileMenuOpen])

  const handleBurgerClick = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu()
    }
    setMobileMenuOpen((prev) => !prev)
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full max-w-full overflow-x-hidden border-b border-border/60 bg-background transition-colors flex flex-col shadow-xs",
          mobileMenuOpen && "fixed inset-0 h-dvh max-h-dvh bg-background border-b-0",
          className
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 shrink-0 min-w-0">
          {/* Left: Brand & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-3 shrink-0">
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

            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-85"
            >
              <LogoMark className="size-6" />
              <span className="tracking-tight font-semibold text-foreground text-sm sm:text-base">
                {brandTitle}
              </span>
              {badgeLabel && (
                <Badge
                  variant="secondary"
                  className="hidden xs:inline-flex text-[10px] px-1.5 py-0 font-medium"
                >
                  {badgeLabel}
                </Badge>
              )}
            </Link>
          </div>

          {/* Center: Search (Live Input or Modal Trigger - Desktop Only) */}
          <div className="hidden md:flex flex-1 max-w-md items-center mx-2 sm:mx-6">
            {setSearchQuery ? (
              <div className="relative flex w-full items-center rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all focus-within:border-primary/40 focus-within:bg-muted/70 focus-within:text-foreground shadow-xs">
                <MagnifyingGlassIcon className="size-3.5 text-muted-foreground shrink-0 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={
                    searchPlaceholder ||
                    "Search components (e.g. Button, Dialog, Chart)..."
                  }
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none border-none p-0 focus:ring-0"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="ml-2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted text-[10px] cursor-pointer"
                  >
                    Clear
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-xs shrink-0 ml-2">
                    /
                  </kbd>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/70 hover:text-foreground cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <MagnifyingGlassIcon className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[12px] truncate">
                    {searchPlaceholder || "Search docs & components..."}
                  </span>
                </div>
                <kbd className="hidden sm:inline-block rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-xs shrink-0 ml-2">
                  /
                </kbd>
              </button>
            )}
          </div>

          {/* Right: Desktop Links & Actions + Mobile Burger Menu Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {children}

            <ButtonGroup className="hidden md:inline-flex">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/design-system" />}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <SparkleIcon className="size-3.5 text-primary" />
                <span>Design System</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                render={<Link href="/docs" />}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <BookOpenIcon className="size-3.5 text-primary" />
                <span>Docs</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                render={<Link href="/" />}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <HouseIcon className="size-3.5 text-primary" />
                <span>Landing</span>
              </Button>
            </ButtonGroup>

            {/* Upper Header GitHub Icon Button */}
            <Button
              variant="outline"
              size="icon-xs"
              render={
                <Link
                  href="https://github.com/dev-celestia/celestia-starter"
                  target="_blank"
                  rel="noreferrer"
                />
              }
              className="text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              aria-label="GitHub Repository"
            >
              <GithubLogoIcon className="size-4 text-primary" weight="bold" />
            </Button>

            <ThemeCustomizer />

            {/* Mobile Burger Menu Button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleBurgerClick}
              className="md:hidden text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-header-navbar"
            >
              {mobileMenuOpen ? (
                <XIcon className="size-5 text-primary" />
              ) : (
                <ListIcon className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Overlay */}
        {mobileMenuOpen && (
          <div
            id="mobile-header-navbar"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden flex flex-col justify-between overflow-y-auto overscroll-contain px-4 sm:px-6 pt-4 pb-8 md:hidden animate-in fade-in-0 duration-200"
          >
            <div className="flex flex-col gap-5">
              {/* Mobile Search Input (live search or modal trigger) */}
              {setSearchQuery ? (
                <div className="relative flex w-full items-center rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs text-muted-foreground transition-all focus-within:border-primary/40 focus-within:bg-muted/70">
                  <MagnifyingGlassIcon className="size-4 text-muted-foreground shrink-0 mr-2" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder || "Search components..."}
                    value={searchQuery || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none border-none p-0 focus:ring-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="ml-2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground hover:bg-muted/70 cursor-pointer shadow-xs"
                >
                  <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium">
                    {searchPlaceholder || "Search docs & components..."}
                  </span>
                  <kbd className="ml-auto rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    /
                  </kbd>
                </button>
              )}

              {/* Simple Text Navigation List */}
              <nav className="flex flex-col gap-1 py-1">
                <Link
                  href="/design-system"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:bg-muted"
                >
                  Design System
                </Link>

                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:bg-muted"
                >
                  Documentation
                </Link>

                <Link
                  href="https://0xbuffer.com/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:bg-muted"
                >
                  <span>Hexbuffer (Products)</span>
                  <ArrowSquareOutIcon className="size-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:bg-muted"
                >
                  Landing Page
                </Link>
              </nav>

              {children && (
                <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Actions
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">{children}</div>
                </div>
              )}
            </div>

            {/* Footer Status */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <span>Next.js 16 • Hono • Drizzle</span>
              <span className="font-mono text-[10px]">v0.0.1</span>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal (when not using live input search) */}
      {!setSearchQuery && (
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      )}
    </>
  )
}

export type DocsHeaderProps = Omit<HeaderProps, "variant">

export function DocsHeader(props: Readonly<DocsHeaderProps>) {
  return <Header variant="docs" {...props} />
}

export type ComponentsHeaderProps = Omit<HeaderProps, "variant">

export function ComponentsHeader(props: Readonly<ComponentsHeaderProps>) {
  return <Header variant="showcase" {...props} />
}

