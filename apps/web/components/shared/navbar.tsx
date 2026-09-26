"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BookOpenIcon,
  CaretDownIcon,
  GithubLogoIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PaletteIcon,
  SparkleIcon,
  TriangleDashedIcon,
  XIcon,
} from "@phosphor-icons/react"
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { LogoMark } from "@/components/shared/logo-mark"
import { SearchDialog } from "@/components/docs/search-dialog"
import { ThemeCustomizer } from "@/components/shared/theme-customizer"

/**
 * The one navbar for every Celestia surface.
 *
 * Two variants share one shell — brand, theme control, mobile drawer:
 *
 * - `"app"` (default) — docs, design system. Sticky bordered
 *   bar with search (live input or ⌘K dialog) and section tabs. Sidebar
 *   toggle via `onToggleMobileMenu`; right-side extras via `children`.
 * - `"landing"` — marketing home. Fixed bar that sits transparent over
 *   the hero and picks up a blurred background on scroll, with anchor
 *   links, a Products dropdown, and a call-to-action.
 */

/** Landing: in-page sections, in the order they appear on the page. */
const LANDING_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Process", href: "#process" },
  { label: "Tech Stack", href: "#tech-stack" },
]

/**
 * Landing: the starter's own surfaces, grouped under one trigger so the
 * top level stays scannable. `Design System` used to sit at the top
 * level next to the marketing links, which mixed "where do I learn
 * about your services" with "where is the component gallery".
 */
const LANDING_PRODUCTS = [
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

const LANDING_CTA = { label: "Book a Consultation", href: "#contact" }

/** App-shell mobile drawer links, in reading order. */
const APP_MOBILE_LINKS = [
  { label: "Design System", href: "/design-system" },
  { label: "Documentation", href: "/docs" },
  {
    label: "Hexbuffer (Products)",
    href: "https://0xbuffer.com/",
    external: true,
  },
  { label: "Landing Page", href: "/" },
]

export interface NavbarProps {
  variant?: "app" | "landing"
  brandTitle?: React.ReactNode
  badgeLabel?: string
  /** When set, the badge becomes a link (e.g. the project repo). */
  badgeHref?: string
  /** Controlled live search. Omit to use the ⌘K search dialog instead. */
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  searchPlaceholder?: string
  /** Docs/dashboard sidebar toggle — burger on <lg screens. */
  onToggleMobileMenu?: () => void
  className?: string
  children?: React.ReactNode
}

export function Navbar({
  variant = "app",
  brandTitle = "Celestia",
  badgeLabel,
  badgeHref,
  onToggleMobileMenu,
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
  className = "",
  children,
}: Readonly<NavbarProps>) {
  const isLanding = variant === "landing"
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
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

      if (isLanding) return

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
  }, [setSearchQuery, mobileMenuOpen, isLanding])

  // Landing chrome: transparent over the hero, blurred once scrolled
  React.useEffect(() => {
    if (!isLanding) return

    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isLanding])

  const handleBurgerClick = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu()
    }
    setMobileMenuOpen((prev) => !prev)
  }

  const badge = (
    <Badge
      variant="secondary"
      className="hidden xs:inline-flex text-[10px] px-1.5 py-0 font-medium"
    >
      {badgeLabel}
    </Badge>
  )

  return (
    <>
      <header
        className={cn(
          "w-full max-w-full overflow-x-hidden flex flex-col transition-colors duration-normal",
          isLanding
            ? cn(
                "fixed inset-x-0 top-0 z-50",
                // `bg-background`, not the landing palette's `bg-bg`: this page is
                // theme-switchable, so a forced-dark bar turned into a black stripe
                // across a white page in light mode.
                scrolled
                  ? "border-b border-border/60 bg-background/90 backdrop-blur-xl"
                  : "border-b border-transparent bg-transparent"
              )
            : cn(
                "sticky top-0 z-40 border-b border-border/60 bg-background shadow-xs",
                mobileMenuOpen && "fixed inset-0 h-dvh max-h-dvh bg-background border-b-0"
              ),
          className
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-7xl items-center justify-between shrink-0 min-w-0",
            isLanding ? "h-16 gap-4 px-5 sm:px-8" : "h-14 gap-3 px-4 sm:px-6 lg:px-8"
          )}
        >
          {/* Left: Brand & Sidebar Toggle */}
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
              className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <LogoMark className={isLanding ? undefined : "size-6"} />
              {typeof brandTitle === "string" && brandTitle.includes(" / ") ? (
                <span className="flex items-center gap-1.5 tracking-tight text-sm sm:text-base">
                  {brandTitle.split(" / ").map((part, index, arr) => (
                    <React.Fragment key={part}>
                      <span className={index === 0 ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}>
                        {part}
                      </span>
                      {index < arr.length - 1 && (
                        <span className="text-muted-foreground/40 font-normal select-none">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </span>
              ) : (
                <span
                  className={cn(
                    "tracking-tight font-semibold text-foreground",
                    isLanding ? "text-[15px] tracking-[-0.01em]" : "text-sm sm:text-base"
                  )}
                >
                  {brandTitle}
                </span>
              )}
              {badgeLabel && (
                badgeHref ? (
                  <Link href={badgeHref} target="_blank" rel="noreferrer" className="transition-opacity hover:opacity-85">
                    {badge}
                  </Link>
                ) : (
                  badge
                )
              )}
            </Link>
          </div>

          {/* Center: Search (app) or Landing Links — Desktop Only */}
          {isLanding ? (
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
                  {LANDING_PRODUCTS.map((item) => (
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

              {LANDING_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex flex-1 max-w-md items-center mx-2 sm:mx-6">
              {setSearchQuery ? (
                <div className="relative flex w-full items-center rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all focus-within:border-primary/40 focus-within:bg-muted/70 focus-within:text-foreground shadow-xs">
                  <MagnifyingGlassIcon className="size-3.5 text-muted-foreground shrink-0 me-2" />
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
                      className="ms-2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted text-[10px] cursor-pointer"
                    >
                      Clear
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-block rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-xs shrink-0 ms-2">
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
                  <kbd className="hidden sm:inline-block rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-xs shrink-0 ms-2">
                    /
                  </kbd>
                </button>
              )}
            </div>
          )}

          {/* Right: Actions */}
          <div className={cn("flex items-center shrink-0", isLanding ? "gap-2" : "gap-1.5")}>
            {!isLanding && children}

            {!isLanding && (
              <Tabs
                value={
                  pathname?.startsWith("/design-system")
                    ? "/design-system"
                    : pathname?.startsWith("/docs")
                      ? "/docs"
                      : pathname === "/"
                        ? "/"
                        : undefined
                }
                className="hidden md:inline-flex"
              >
                <TabsList>
                  <TabsTrigger
                    value="/design-system"
                    render={<Link href="/design-system" />}
                  >
                    <SparkleIcon className="size-3.5 text-primary" />
                    <span>Design System</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="/docs"
                    render={<Link href="/docs" />}
                  >
                    <BookOpenIcon className="size-3.5 text-primary" />
                    <span>Docs</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {!isLanding && (
              <Button
                variant="ghost"
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
            )}

            <ThemeCustomizer />

            {isLanding && (
              <Button
                size="sm"
                className="hidden gap-1.5 md:inline-flex"
                render={<Link href={LANDING_CTA.href} />}
              >
                {LANDING_CTA.label}
                <ArrowRightIcon className="size-3.5" />
              </Button>
            )}

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
            className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden flex flex-col justify-between overflow-y-auto overscroll-contain px-4 sm:px-6 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:hidden animate-in fade-in-0 duration-normal"
          >
            <div className="flex flex-col gap-5">
              {/* Mobile Search Input (live search or modal trigger) — app only */}
              {!isLanding &&
                (setSearchQuery ? (
                  <div className="relative flex w-full items-center rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs text-muted-foreground transition-all focus-within:border-primary/40 focus-within:bg-muted/70">
                    <MagnifyingGlassIcon className="size-4 text-muted-foreground shrink-0 me-2" />
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
                        className="ms-2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted cursor-pointer"
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
                    <kbd className="ms-auto rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      /
                    </kbd>
                  </button>
                ))}

              {/* Simple Text Navigation List */}
              <nav className="flex flex-col gap-1 py-1">
                {isLanding
                  ? LANDING_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-[44px] items-center rounded-lg px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:bg-muted"
                      >
                        {link.label}
                      </Link>
                    ))
                  : APP_MOBILE_LINKS.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-[44px] items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:bg-muted"
                      >
                        <span>{link.label}</span>
                        {link.external && (
                          <ArrowSquareOutIcon className="size-3.5 text-muted-foreground" />
                        )}
                      </Link>
                    ))}

                {isLanding && (
                  <>
                    <p className="mt-4 px-3.5 pb-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Products
                    </p>
                    {LANDING_PRODUCTS.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        {...(item.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-[44px] items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:bg-muted"
                      >
                        <span>{item.label}</span>
                        {item.external && (
                          <ArrowSquareOutIcon className="size-3.5 text-muted-foreground" />
                        )}
                      </Link>
                    ))}
                  </>
                )}
              </nav>

              {!isLanding && children && (
                <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Actions
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">{children}</div>
                </div>
              )}
            </div>

            {/* Footer: landing CTA, or stack status line */}
            <div className="mt-8 pt-4 border-t border-border/60">
              {isLanding ? (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  render={<Link href={LANDING_CTA.href} onClick={() => setMobileMenuOpen(false)} />}
                >
                  {LANDING_CTA.label}
                  <ArrowRightIcon className="size-4" />
                </Button>
              ) : (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Next.js 16 • Hono • Drizzle</span>
                  <span className="font-mono text-[10px]">v0.0.1</span>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Modal (when not using live input search) */}
      {!isLanding && !setSearchQuery && (
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      )}
    </>
  )
}
