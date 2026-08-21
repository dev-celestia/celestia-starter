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
  BookOpenIcon,
  HouseIcon,
} from "@phosphor-icons/react"
import {
  Button,
  Badge,
  Input,
  InputGroup,
  InputGroupAddon,
  ButtonGroup,
} from "@celestia-project/ui"
import { LogoMark } from "@/components/landing/nav-bar"
import { SearchDialog } from "@/components/docs/search-dialog"

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
  brandTitle,
  badgeLabel,
  badgeHref,
  onToggleMobileMenu,
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
  totalComponents,
  className = "",
  children,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    // Only register keyboard shortcut if not using live input search
    if (!setSearchQuery) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault()
          setSearchOpen((prev) => !prev)
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [setSearchQuery])

  // Derive defaults based on variant
  const isShowcase = variant === "showcase"
  const defaultBrandTitle = isShowcase ? "Celestia UI" : "Celestia"
  const resolvedBrandTitle = brandTitle ?? defaultBrandTitle
  const defaultBadgeLabel = isShowcase ? "Showcase" : "Docs"
  const resolvedBadgeLabel = badgeLabel ?? defaultBadgeLabel
  const defaultBadgeHref = isShowcase ? "/design-system" : "/docs"
  const resolvedBadgeHref = badgeHref ?? defaultBadgeHref

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-colors ${className}`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: Brand & Mobile Toggle */}
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
              className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            >
              <LogoMark className="size-6" />
              <span className="font-bold tracking-tight text-foreground text-sm sm:text-base">
                {resolvedBrandTitle}
              </span>
            </Link>

            <span className="text-muted-foreground/40 font-mono text-sm hidden sm:inline">
              /
            </span>

            <Link href={resolvedBadgeHref}>
              <Badge
                variant="outline"
                className="gap-1 font-mono text-xs font-normal border-primary/20 bg-primary/5 text-primary"
              >
                {isShowcase && (
                  <SparkleIcon
                    className="size-3 text-primary"
                    weight="fill"
                  />
                )}
                {resolvedBadgeLabel}
              </Badge>
            </Link>
          </div>

          {/* Center: Search (Live Input or Modal Trigger) */}
          <div className="flex flex-1 max-w-md items-center mx-2 sm:mx-6">
            {setSearchQuery ? (
              <div className="relative w-full">
                <InputGroup className="h-9 w-full border rounded-lg pr-[3px]">
                  <InputGroupAddon>
                    <MagnifyingGlassIcon className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <Input
                    type="text"
                    placeholder={
                      searchPlaceholder ||
                      `Search ${
                        totalComponents ? `${totalComponents}+ ` : ""
                      }components (e.g. Button, Dialog, Chart)...`
                    }
                    value={searchQuery || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-md ml-1"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mr-2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted text-[10px] cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </InputGroup>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-full text-left cursor-pointer group"
              >
                <InputGroup className="h-9 w-full border rounded-lg pr-[3px] transition-colors hover:border-primary/40">
                  <InputGroupAddon>
                    <MagnifyingGlassIcon className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </InputGroupAddon>
                  <Input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    placeholder={searchPlaceholder || "Search docs & components..."}
                    className="rounded-md ml-1 pointer-events-none cursor-pointer text-xs"
                  />
                  <InputGroupAddon align="inline-end">
                    <kbd className="hidden sm:inline-block rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-xs">
                      ⌘K
                    </kbd>
                  </InputGroupAddon>
                </InputGroup>
              </button>
            )}
          </div>

          {/* Right: Quick Links & Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {children}

            <ButtonGroup className="hidden sm:inline-flex">
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
                render={
                  <Link
                    href="https://github.com/celestia-realm/celestia-starter"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                className="hidden md:inline-flex gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <GithubLogoIcon className="size-4" />
                <span>GitHub</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                render={<Link href="/" />}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <HouseIcon className="size-3.5" />
                <span>Landing</span>
              </Button>
            </ButtonGroup>

            {mounted && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                aria-label="Toggle theme"
                title="Toggle theme"
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

      {/* Search Modal (when not using live input search) */}
      {!setSearchQuery && (
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      )}
    </>
  )
}

export type DocsHeaderProps = Omit<HeaderProps, "variant">

export function DocsHeader(props: DocsHeaderProps) {
  return <Header variant="docs" {...props} />
}

export type ComponentsHeaderProps = Omit<HeaderProps, "variant">

export function ComponentsHeader(props: ComponentsHeaderProps) {
  return <Header variant="showcase" {...props} />
}
