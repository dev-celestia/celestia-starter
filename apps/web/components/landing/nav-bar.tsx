"use client"

import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import {
  ArrowSquareOutIcon,
  BookOpenIcon,
  CaretDownIcon,
  CaretRightIcon,
  GithubLogoIcon,
  ListIcon,
  SparkleIcon,
  TriangleDashedIcon,
  WarningIcon,
  XIcon,
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

const GITHUB_URL = "https://github.com/dev-celestia/celestia-starter"

export function LogoMark({ className }: Readonly<{ className?: string }>) {
  return (
    <Image
      src="/celestia-icon.png"
      alt="Celestia Logo"
      width={28}
      height={28}
      className={cn("size-7 object-contain shrink-0 rounded-md", className)}
      priority
    />
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
        "fixed inset-x-0 top-0 z-50 w-full max-w-full overflow-x-hidden transition-colors flex flex-col backdrop-blur-xl border-b border-stroke/80 shadow-xs",
        mobileMenuOpen && "h-dvh max-h-dvh",
      )}
    >
      {/* Active Development Warning Bar */}
      <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-xs text-amber-200/90 shrink-0">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
          <WarningIcon className="size-4 shrink-0 text-amber-400" />
          <span className="truncate">
            <strong className="font-medium text-amber-300">Under Active Development:</strong> Features are undergoing testing and refinement.
          </span>
        </div>
      </div>

      <nav
        aria-label="Main"
        className="mx-auto flex py-3 w-full max-w-6xl items-center justify-between px-5 sm:px-8 shrink-0 min-w-0"
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
            <DropdownMenuContent align="start" className="w-72 p-2 border-stroke/80 bg-bg shadow-xl">
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
            render={<Link href="/docs/libs/nuclei-run" />}
          >
            Libraries
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
            size="icon-sm"
            aria-label="GitHub Repository"
            className="cursor-pointer active:scale-95 transition-transform ml-2"
            render={<Link href={GITHUB_URL} target="_blank" rel="noreferrer" />}
          >
            <GithubLogoIcon className="size-4" weight="fill" />
          </Button>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <Button
            size="icon-sm"
            aria-label="GitHub Repository"
            render={<Link href={GITHUB_URL} target="_blank" rel="noreferrer" />}
          >
            <GithubLogoIcon className="size-4" weight="fill" />
          </Button>

          {/* Clean Rounded-lg Burger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-overlay"
            className="flex size-9 items-center justify-center rounded-lg border border-stroke/80 bg-surface text-text-primary hover:bg-surface/80 active:scale-95 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? (
              <XIcon className="size-5 text-primary" />
            ) : (
              <ListIcon className="size-5" />
            )}
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
          className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden flex flex-col justify-between overflow-y-auto overscroll-contain px-5 pt-4 pb-8 md:hidden animate-in fade-in-0 duration-200"
        >
          <div className="flex flex-col gap-5">
            {/* Simple Text Navigation List */}
            <nav className="flex flex-col gap-1 py-1">
              <Link
                href="/design-system"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface/60 active:bg-surface"
              >
                Design System
              </Link>

              <Link
                href="/docs/libs/nuclei-run"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface/60 active:bg-surface"
              >
                Libraries
              </Link>

              <Link
                href="/docs"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface/60 active:bg-surface"
              >
                Documentation
              </Link>

              <Link
                href="https://0xbuffer.com/"
                target="_blank"
                rel="noreferrer"
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface/60 active:bg-surface"
              >
                <span>Hexbuffer (Products)</span>
                <ArrowSquareOutIcon className="size-3.5 text-fog" />
              </Link>

              <Link
                href="/"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface/60 active:bg-surface"
              >
                Landing Page
              </Link>
            </nav>
          </div>

          {/* Bottom Footer Status */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-stroke/60 text-xs text-fog">
            <span>Next.js 16 • Hono • Drizzle</span>
            <span className="font-mono text-[10px] text-fog/80">v0.0.1</span>
          </div>
        </div>
      )}
    </header>
  )
}

