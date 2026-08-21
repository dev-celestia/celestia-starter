"use client"

import Link from "next/link"
import * as React from "react"
import {
  ArrowSquareOutIcon,
  BookOpenIcon,
  CaretDownIcon,
  CaretRightIcon,
  GithubLogoIcon,
  SparkleIcon,
  TriangleDashedIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

const GITHUB_URL = "https://github.com/celestia-realm/celestia-starter"

export function LogoMark({ className }: Readonly<{ className?: string }>) {
  return (
    <span
      aria-hidden
      className={cn(
        "accent-gradient grid size-7 place-items-center rounded-full shrink-0 shadow-sm",
        className,
      )}
    >
      <span className="grid size-[22px] place-items-center rounded-full bg-bg">
        <span className="size-1.5 rounded-full bg-[#89aacc]" />
      </span>
    </span>
  )
}

export function NavBar() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const headerRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [mobileMenuOpen])

  // Close on Escape key press
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileMenuOpen])

  const closeMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        scrolled || mobileMenuOpen
          ? "border-b border-stroke/80 bg-bg/90 backdrop-blur-2xl shadow-xs"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/* Active Development Warning Bar */}
      <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-xs text-amber-200/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
          <WarningIcon className="size-4 shrink-0 text-amber-400" />
          <span className="truncate">
            <strong className="font-medium text-amber-300">Under Active Development:</strong> Features are undergoing testing and refinement.
          </span>
        </div>
      </div>

      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2.5 text-text-primary transition-opacity hover:opacity-90 active:scale-[0.98] motion-reduce:active:scale-100"
        >
          <LogoMark />
          <span className="text-[15px] font-medium tracking-[-0.01em]">
            Celestia
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer active:scale-[0.98] transition-transform">
                  <span>Products</span>
                  <CaretDownIcon className="size-3 text-muted-foreground transition-transform duration-200" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-72 p-2 border-stroke/80 bg-bg/95 backdrop-blur-xl shadow-xl">
              <DropdownMenuItem
                render={
                  <Link
                    href="https://0xbuffer.com/"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                className="cursor-pointer items-start gap-2.5 p-2 rounded-lg transition-colors hover:bg-surface active:scale-[0.99]"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary mt-0.5">
                  <TriangleDashedIcon className="size-3.5" weight="bold" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs text-foreground">Hexbuffer</span>
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 text-[9px] font-mono border-amber-500/30 bg-amber-500/10 text-amber-300"
                    >
                      ALPHA
                    </Badge>
                    <ArrowSquareOutIcon className="size-3 ml-auto text-muted-foreground shrink-0" />
                  </div>
                  <span className="text-[11px] text-muted-foreground leading-normal">
                    Modern security & application toolkit
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer active:scale-[0.98] transition-transform"
            render={<Link href="/design-system" />}
          >
            Design System
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer active:scale-[0.98] transition-transform"
            render={<Link href="/docs" />}
          >
            Docs
          </Button>

          <Button
            variant="default"
            size="sm"
            aria-label="Star on GitHub"
            className="ml-4 -mt-0.5 cursor-pointer active:scale-[0.97] transition-transform"
            render={<Link href={GITHUB_URL} target="_blank" rel="noreferrer" />}
          >
            <GithubLogoIcon className="size-3.5" weight="fill" />
            Star on Github
          </Button>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="GitHub Repository"
            className="size-8 rounded-full border-stroke/80 bg-surface/60 active:scale-95 transition-transform"
            render={<Link href={GITHUB_URL} target="_blank" rel="noreferrer" />}
          >
            <GithubLogoIcon className="size-4" weight="fill" />
          </Button>

          {/* Apple-style Animated Hamburger / Close Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-overlay"
            className="relative flex size-9 items-center justify-center rounded-full border border-stroke/80 bg-surface/60 text-text-primary transition-all duration-200 hover:bg-surface active:scale-90 active:bg-surface-elevated focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
          >
            <div className="relative flex size-4 flex-col items-center justify-center">
              <span
                className={cn(
                  "absolute h-[1.5px] w-4 rounded-full bg-current transition-all duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen
                    ? "rotate-45 translate-y-0"
                    : "-translate-y-1.5"
                )}
              />
              <span
                className={cn(
                  "absolute h-[1.5px] w-4 rounded-full bg-current transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                )}
              />
              <span
                className={cn(
                  "absolute h-[1.5px] w-4 rounded-full bg-current transition-all duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen
                    ? "-rotate-45 translate-y-0"
                    : "translate-y-1.5"
                )}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Apple-style Mobile Navigation Overlay & Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-x-0 bottom-0 top-[calc(4rem+33px)] z-40 flex flex-col justify-between overflow-y-auto overscroll-contain bg-bg/95 backdrop-blur-2xl border-t border-stroke/70 px-5 pt-4 pb-8 md:hidden animate-in fade-in-0 duration-250 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]"
        >
          <div className="flex flex-col gap-5">
            {/* Products / Ecosystem Spotlight Section */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-fog px-1">
                Ecosystem
              </span>
              <Link
                href="https://0xbuffer.com/"
                target="_blank"
                rel="noreferrer"
                onClick={closeMobileMenu}
                className="group flex items-center justify-between rounded-xl border border-stroke/80 bg-surface/70 p-3.5 transition-all duration-200 hover:border-stroke hover:bg-surface active:scale-[0.98] active:bg-surface/90"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <TriangleDashedIcon className="size-4" weight="bold" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-text-primary">Hexbuffer</span>
                      <Badge
                        variant="outline"
                        className="h-4 px-1.5 text-[9px] font-mono border-amber-500/30 bg-amber-500/10 text-amber-300"
                      >
                        ALPHA
                      </Badge>
                    </div>
                    <span className="text-xs text-fog">
                      Modern security & application toolkit
                    </span>
                  </div>
                </div>
                <ArrowSquareOutIcon className="size-4 text-fog transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-fog px-1 mb-1">
                Explore
              </span>
              <Link
                href="/design-system"
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-text-primary transition-all duration-150 hover:bg-surface/60 active:scale-[0.98] active:bg-surface"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-stroke/80 bg-surface/80 text-fog">
                    <SparkleIcon className="size-4 text-[#89aacc]" />
                  </div>
                  <span>Design System</span>
                </div>
                <CaretRightIcon className="size-4 text-fog" />
              </Link>

              <Link
                href="/docs"
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-text-primary transition-all duration-150 hover:bg-surface/60 active:scale-[0.98] active:bg-surface"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-stroke/80 bg-surface/80 text-fog">
                    <BookOpenIcon className="size-4 text-[#89aacc]" />
                  </div>
                  <span>Documentation</span>
                </div>
                <CaretRightIcon className="size-4 text-fog" />
              </Link>
            </div>
          </div>

          {/* Bottom Actions & Status */}
          <div className="mt-8 flex flex-col gap-3 pt-4 border-t border-stroke/60">
            <Button
              variant="default"
              size="lg"
              className="w-full justify-center gap-2 text-sm font-medium shadow-md active:scale-[0.98] transition-transform"
              render={
                <Link
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMobileMenu}
                />
              }
            >
              <GithubLogoIcon className="size-4" weight="fill" />
              <span>Star Celestia on GitHub</span>
            </Button>

            <div className="flex items-center justify-between px-1 text-[11px] text-fog">
              <span>Next.js 16 • Hono • Drizzle</span>
              <span className="font-mono text-[10px] text-fog/80">v0.0.1</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

