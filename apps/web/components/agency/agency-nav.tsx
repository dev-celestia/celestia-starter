"use client"

import Link from "next/link"
import * as React from "react"
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CaretDownIcon,
  ListIcon,
  MoonIcon,
  SparkleIcon,
  SunIcon,
  TriangleDashedIcon,
  XIcon,
} from "@phosphor-icons/react"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { useTheme } from "next-themes"

import { LogoMark } from "@/components/shared/logo-mark"

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
]

export function AgencyNav() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => { setMounted(true) }, [])

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = prev }
    }
  }, [mobileOpen])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const close = () => setMobileOpen(false)

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300 flex flex-col",
        scrolled
          ? "bg-bg/90 backdrop-blur-xl border-b border-border/60 shadow-sm"
          : "bg-transparent",
        mobileOpen && "h-dvh max-h-dvh bg-bg/95 backdrop-blur-xl border-b border-border/60",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 shrink-0"
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-85 active:scale-[0.98]"
        >
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Celestia</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {/* Products dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer active:scale-[0.98] transition-transform">
                  <span>Products</span>
                  <CaretDownIcon className="size-3 text-muted-foreground transition-transform duration-normal" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-72 p-2 border-border bg-popover shadow-xl">
              <DropdownMenuItem
                render={
                  <Link
                    href="https://0xbuffer.com/"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                className="cursor-pointer items-start gap-2.5 p-2 rounded-lg transition-colors hover:bg-accent active:scale-[0.99]"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary mt-0.5">
                  <TriangleDashedIcon className="size-3.5" weight="bold" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs text-foreground">Hexbuffer</span>
                    <ArrowSquareOutIcon className="size-3 ms-auto text-muted-foreground shrink-0" />
                  </div>
                  <span className="text-[11px] text-muted-foreground leading-normal">
                    Modern security & application toolkit
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                render={<Link href="/feature-installer" />}
                className="cursor-pointer items-start gap-2.5 p-2 rounded-lg transition-colors hover:bg-accent active:scale-[0.99]"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary mt-0.5">
                  <SparkleIcon className="size-3.5" weight="bold" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs text-foreground">Feature Installer</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground leading-normal">
                    One-command full-stack starter kit
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Design System */}
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer active:scale-[0.98] transition-transform"
            render={<Link href="/design-system" />}
          >
            Design System
          </Button>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="cursor-pointer"
          >
            {mounted && resolvedTheme === "dark" ? (
              <SunIcon className="size-4" weight="bold" />
            ) : (
              <MoonIcon className="size-4" weight="bold" />
            )}
          </Button>
          <Link href="#contact">
            <Button
              size="sm"
              className="gap-1.5 cursor-pointer active:scale-[0.98] transition-transform"
            >
              Book a Consultation
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="cursor-pointer"
          >
            {mounted && resolvedTheme === "dark" ? (
              <SunIcon className="size-4" weight="bold" />
            ) : (
              <MoonIcon className="size-4" weight="bold" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="cursor-pointer"
          >
            {mobileOpen ? (
              <XIcon className="size-5 text-primary" />
            ) : (
              <ListIcon className="size-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="flex-1 flex flex-col overflow-y-auto overscroll-contain px-5 pt-4 pb-10 md:hidden animate-in fade-in-0 duration-200"
        >
          <nav className="flex flex-col gap-1">
            {/* Products */}
            <Link
              href="https://0xbuffer.com/"
              target="_blank"
              rel="noreferrer"
              onClick={close}
              className="flex min-h-[48px] items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-white/5 active:bg-white/10"
            >
              <span>Hexbuffer (Products)</span>
              <ArrowSquareOutIcon className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/feature-installer"
              onClick={close}
              className="flex min-h-[48px] items-center rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-white/5 active:bg-white/10"
            >
              Feature Installer
            </Link>

            {/* Design System */}
            <Link
              href="/design-system"
              onClick={close}
              className="flex min-h-[48px] items-center rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-white/5 active:bg-white/10"
            >
              Design System
            </Link>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="flex min-h-[48px] items-center rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-white/5 active:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-border/60 pt-6">
            <Link href="#contact" onClick={close}>
              <Button size="lg" className="w-full gap-2 cursor-pointer">
                Book a Consultation
                <ArrowRightIcon className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
