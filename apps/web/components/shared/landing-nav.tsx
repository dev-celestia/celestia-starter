import Link from "next/link"
import { ArrowRightIcon, ArrowSquareOutIcon, GithubLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@celestia-project/ui"

import {
  GITHUB_URL,
  LANDING_ANCHORS,
  LANDING_CTA,
  LANDING_SURFACES,
} from "@/components/shared/landing-links"
import { LogoMark } from "@/components/shared/logo-mark"
import { ThemeCustomizer } from "@/components/shared/theme-customizer"

/**
 * The landing navigation — one `<nav>`, two shapes.
 *
 * Below `lg` it is a static top bar: the brand row, the anchor links
 * wrapping beneath it, and the action row behind a dashed divider. It
 * scrolls away with the page, so no scroll-offset bookkeeping is needed.
 * From `lg` up it becomes a fixed left rail (`w-80`) with the links in a
 * column and the actions pinned to the bottom; the page content offsets
 * itself with `lg:ml-80`.
 *
 * Surfaces (Design System, Docs, …) only render in the rail on lg+; the
 * footer's Explore group carries them at every viewport, so hiding them
 * from the mobile bar never orphans a destination.
 *
 * Colour comes exclusively from the semantic tokens, so the rail follows
 * the light/dark theme and the accent customizer like every other surface.
 */
export function LandingNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-border bg-background [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-80 lg:overflow-y-auto lg:border-r lg:border-b-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 px-5 py-5 sm:px-8 lg:min-h-full lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:px-8 lg:py-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm text-lg font-semibold tracking-[-0.01em] text-foreground transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <LogoMark className="size-7" />
          Celestia
        </Link>

        <div className="flex w-full flex-col gap-5 lg:mt-14 lg:flex-1 lg:gap-8">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 lg:flex-col lg:items-stretch lg:gap-1">
            {LANDING_ANCHORS.map((link) => (
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

          {/* Starter surfaces — rail-only; the footer carries them on mobile. */}
          <div className="hidden lg:block">
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
              <Button size="sm" render={<Link href={LANDING_CTA.href} />}>
                {LANDING_CTA.label}
                <ArrowRightIcon className="size-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
