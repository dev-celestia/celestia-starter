"use client"

import Link from "next/link"
import * as React from "react"
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CaretDownIcon,
  ListIcon,
  MoonIcon,
  PaletteIcon,
  SparkleIcon,
  SunIcon,
  TriangleDashedIcon,
} from "@phosphor-icons/react"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { useTheme } from "next-themes"

import { LogoMark } from "@/components/shared/logo-mark"

/** In-page sections, in the order they appear on the page. */
const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Process", href: "#process" },
  { label: "Tech Stack", href: "#tech-stack" },
]

/**
 * The starter's own surfaces, grouped under one trigger so the top level stays
 * scannable. `Design System` used to sit at the top level next to the marketing
 * links, which mixed "where do I learn about your services" with "where is the
 * component gallery".
 */
const PRODUCT_LINKS = [
  {
    label: "Hexbuffer",
    description: "Modern security & application toolkit",
    href: "https://0xbuffer.com/",
    icon: TriangleDashedIcon,
    external: true,
  },
  {
    label: "Feature Installer",
    description: "One-command full-stack starter kit",
    href: "/feature-installer",
    icon: SparkleIcon,
    external: false,
  },
  {
    label: "Design System",
    description: "Tokens, primitives and patterns",
    href: "/design-system",
    icon: PaletteIcon,
    external: false,
  },
]

export function AgencyNav() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const themeButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label="Toggle colour theme"
    >
      {mounted && resolvedTheme === "dark" ? (
        <SunIcon className="size-4" weight="bold" />
      ) : (
        <MoonIcon className="size-4" weight="bold" />
      )}
    </Button>
  )

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full transition-colors duration-normal",
        // `bg-background`, not the landing palette's `bg-bg`: this page is
        // theme-switchable, so a forced-dark bar turned into a black stripe
        // across a white page in light mode.
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md text-foreground transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Celestia</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <span>Products</span>
                  <CaretDownIcon className="size-3 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="start"
              className="w-72 border-border bg-popover p-2 shadow-xl"
            >
              {PRODUCT_LINKS.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  render={
                    <Link
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                    />
                  }
                  className="cursor-pointer items-start gap-2.5 rounded-lg p-2"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                    <item.icon className="size-3.5" weight="bold" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.external ? (
                        <ArrowSquareOutIcon className="ms-auto size-3 shrink-0 text-muted-foreground" />
                      ) : null}
                    </div>
                    <span className="text-2xs leading-normal text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {themeButton}
          <Button
            size="sm"
            className="gap-1.5"
            render={<Link href="#contact" />}
          >
            Book a Consultation
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          {themeButton}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="secondary"
                  size="icon-sm"
                  aria-label="Open navigation menu"
                />
              }
            >
              <ListIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full gap-0 sm:max-w-xs">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <LogoMark />
                  Celestia
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation
                </SheetDescription>
              </SheetHeader>

              <nav
                aria-label="Mobile"
                className="flex flex-1 flex-col gap-1 overflow-y-auto px-3"
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-12 items-center rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}

                <p className="mt-4 px-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Products
                </p>
                {PRODUCT_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-12 items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <span>{item.label}</span>
                    {item.external ? (
                      <ArrowSquareOutIcon className="size-4 text-muted-foreground" />
                    ) : null}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t border-border/60 p-6">
                <Button
                  size="lg"
                  className="w-full gap-2"
                  render={<Link href="#contact" onClick={() => setMobileOpen(false)} />}
                >
                  Book a Consultation
                  <ArrowRightIcon className="size-4" />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
