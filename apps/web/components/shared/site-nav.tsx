"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CaretDownIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Button } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

import {
  GITHUB_URL,
  LANDING_ANCHORS,
  LANDING_CTA,
  LANDING_SURFACES,
} from "@/components/shared/landing-links"
import { LogoMark } from "@/components/shared/logo-mark"
import { ThemeCustomizer } from "@/components/shared/theme-customizer"

export interface SiteLink {
  label: string
  href: string
  external?: boolean
}

interface SiteNavProps {
  /** In-page section anchors. Empty hides the anchor list entirely. */
  anchors?: readonly SiteLink[]
  /** The cross-surface Explore group (Design System, Docs, …). */
  showSurfaces?: boolean
  /** Rail CTA. `null` hides it on pages where a sales CTA reads wrong. */
  cta?: SiteLink | null
}

/**
 * The site navigation — one `<nav>`, two shapes.
 *
 * Below `lg` it is a static top bar: the brand row, the anchor links
 * wrapping beneath it, and the action row behind a dashed divider. It
 * scrolls away with the page, so no scroll-offset bookkeeping is needed.
 * From `lg` up it becomes a fixed left rail (`w-64`) with the links in a
 * column and the actions pinned to the bottom; page content offsets
 * itself with `lg:ml-64`.
 *
 * The rail hides its scrollbar (it owns the page's left edge), so when
 * the menu is taller than the viewport it would otherwise overflow
 * silently. Two zero-height sticky strips — one pinned to each edge —
 * fade in instead: a bouncing chevron over a bottom fade while there is
 * more menu below, and a top fade once the rail has been scrolled.
 *
 * Surfaces (Design System, Docs, …) only render in the rail on lg+; the
 * footer's Explore group carries them at every viewport, so hiding them
 * from the mobile bar never orphans a destination.
 *
 * Colour comes exclusively from the semantic tokens, so the rail follows
 * the light/dark theme and the accent customizer like every other surface.
 */
function SiteNav({
  anchors = LANDING_ANCHORS,
  showSurfaces = true,
  cta = LANDING_CTA,
}: SiteNavProps) {
  const navRef = React.useRef<HTMLElement | null>(null)
  const [canScroll, setCanScroll] = React.useState({ up: false, down: false })

  React.useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const update = () => {
      const maxScroll = nav.scrollHeight - nav.clientHeight
      const up = nav.scrollTop > 1
      const down = maxScroll > 1 && nav.scrollTop < maxScroll - 1
      setCanScroll((prev) =>
        prev.up === up && prev.down === down ? prev : { up, down }
      )
    }

    update()
    nav.addEventListener("scroll", update, { passive: true })
    // The content column can grow after mount (fonts, customizer state),
    // so track it alongside the rail's own viewport-driven resizes.
    const observer = new ResizeObserver(update)
    observer.observe(nav)
    if (nav.firstElementChild) observer.observe(nav.firstElementChild)

    return () => {
      nav.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [])

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="border-b border-border bg-background [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:overflow-y-auto lg:border-r lg:border-b-0"
    >
      {/* Scroll hints — zero-height sticky strips pinned to the rail's edges. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none sticky top-0 z-10 hidden h-0 transition-opacity duration-300 lg:block",
          canScroll.up ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background via-background/80 to-transparent" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 px-5 py-5 sm:px-8 lg:min-h-full lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:px-6 lg:py-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm text-lg font-semibold tracking-[-0.01em] text-foreground transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <LogoMark className="size-7" />
          Celestia
        </Link>

        <div className="flex w-full flex-col gap-5 lg:mt-14 lg:flex-1 lg:gap-8">
          {anchors.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 lg:flex-col lg:items-stretch lg:gap-1">
              {anchors.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-10 items-center rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Starter surfaces — rail-only; the footer carries them on mobile. */}
          {showSurfaces ? (
            <div className={cn(anchors.length > 0 && "hidden lg:block")}>
              <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Explore
              </p>
              <ul className="mt-1 flex flex-col items-stretch gap-1">
                {LANDING_SURFACES.map((surface) => (
                  <li key={surface.label}>
                    <Link
                      href={surface.href}
                      {...(surface.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="inline-flex min-h-10 items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {surface.label}
                      {surface.external ? (
                        <ArrowSquareOutIcon className="size-3.5" aria-hidden />
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-4 lg:mt-auto lg:flex-col lg:items-stretch">
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <GithubLogoIcon className="size-4" aria-hidden />
              GitHub
              <ArrowSquareOutIcon className="size-3.5" aria-hidden />
            </Link>

            <div className="flex flex-wrap items-center gap-2 lg:justify-between">
              <ThemeCustomizer />
              {cta ? (
                <Button size="sm" render={<Link href={cta.href} />}>
                  {cta.label}
                  <ArrowRightIcon className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none sticky bottom-0 z-10 hidden h-0 transition-opacity duration-300 lg:block",
          canScroll.down ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <CaretDownIcon
          className="absolute bottom-2 left-1/2 size-4 -translate-x-1/2 animate-bounce text-muted-foreground motion-reduce:animate-none"
          weight="bold"
        />
      </div>
    </nav>
  )
}

export { SiteNav }
