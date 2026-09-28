import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowSquareOutIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Button, Separator } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

import { GITHUB_URL, LANDING_SURFACES } from "@/components/shared/landing-links"
import { LogoMark } from "@/components/shared/logo-mark"
import { SiteNav, type SiteLink } from "@/components/shared/site-nav"

export type { SiteLink }

/**
 * Footer nav groups from the agency landing. Pages that don't share those
 * in-page anchors pass their own groups (or `{}` for brand + Explore only).
 */
const AGENCY_FOOTER_GROUPS: Record<string, readonly SiteLink[]> = {
  Company: [
    { label: "Services", href: "#services" },
    { label: "Projects", href: "#projects" },
    { label: "Open Source", href: "#open-source" },
    { label: "How We Work", href: "#process" },
  ],
  Engagement: [
    { label: "Dedicated Squads", href: "#engagement-models" },
    { label: "Time & Materials", href: "#engagement-models" },
    { label: "Fixed Price", href: "#engagement-models" },
    { label: "Book a Consultation", href: "#contact" },
  ],
}

const SOCIALS = [
  { icon: GithubLogoIcon, href: GITHUB_URL, label: "GitHub" },
  { icon: LinkedinLogoIcon, href: "#", label: "LinkedIn" },
  { icon: XLogoIcon, href: "#", label: "X / Twitter" },
]

const LEGAL = ["Privacy Policy", "Terms of Service", "Cookie Policy"]

/**
 * The Explore group mirrors the rail's surfaces on lg+ and is the only
 * place small screens see them, so it is the one column every page has.
 */
const EXPLORE: readonly SiteLink[] = [
  ...LANDING_SURFACES,
  { label: "GitHub", href: GITHUB_URL, external: true },
]

interface SiteFooterProps {
  /** Extra nav columns between the brand and Explore groups. */
  groups?: Record<string, readonly SiteLink[]>
  /** Max width of the footer's content column. */
  maxWidth?: string
}

/** A destination leaves the site if it is flagged external or is an absolute URL. */
function isExternal(item: SiteLink) {
  return Boolean(item.external) || item.href.startsWith("http")
}

/**
 * The site footer.
 *
 * Composition, top to bottom: a brand block (lockup, positioning line,
 * socials) beside the nav columns, then a rule, then the legal row. The
 * nav is a grid whose column count follows the data, so a footer with one
 * column and a footer with three both read as intentional rather than as
 * a row that ran out of items.
 *
 * Three deliberate departures from the old footer, all of which were what
 * made it read as an afterthought:
 *
 * - It sits on `bg-muted/50` rather than `bg-background`, so the footer is
 *   a distinct closing band instead of more page. (`bg-card` would not do:
 *   it is white in light mode, i.e. invisible against the page.) The rule
 *   above it stays `border-border`, matching every other section break.
 * - Column labels are muted and the links are near-full-strength `text-sm`.
 *   Previously both were `text-xs` and the *labels* carried the brightest
 *   colour, so the hierarchy was inverted: you read the headings and had
 *   to squint at the destinations.
 * - A lone column is right-aligned instead of hugging the brand, which is
 *   what every non-landing route gets (they pass `footerGroups={{}}`).
 *
 * The bottom padding clears the fixed Back-to-top / Theme pills, which
 * otherwise land on the legal links at the end of the page.
 */
function SiteFooter({
  groups = AGENCY_FOOTER_GROUPS,
  maxWidth = "max-w-[960px]",
}: SiteFooterProps) {
  const groupColumns = Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }))

  const columns: {
    label: string
    items: readonly SiteLink[]
    /** Long lists break into two columns on small screens instead of stacking. */
    wide: boolean
  }[] = [
    ...groupColumns.map((column) => ({ ...column, wide: false })),
    { label: "Explore", items: EXPLORE, wide: groupColumns.length >= 2 },
  ]

  // Static strings, so Tailwind's scanner can see every branch. Three
  // columns share the width evenly; one column keeps its natural measure
  // and is pushed to the footer's right edge instead of stretching across
  // the block or hugging the brand.
  const brandSpan = columns.length >= 3 ? "lg:col-span-4" : "lg:col-span-5"
  const navSpan = columns.length >= 3 ? "lg:col-span-8" : "lg:col-span-7"
  const navCols =
    columns.length >= 3
      ? "grid-cols-2 sm:grid-cols-3"
      : columns.length === 2
        ? "grid-cols-2"
        : "grid-cols-1 sm:max-w-[12rem] lg:justify-self-end"

  return (
    <footer className="border-t border-border bg-muted/50">
      <div
        className={cn(
          "mx-auto w-full px-5 pt-16 pb-24 sm:px-8 sm:pt-20 sm:pb-20",
          maxWidth
        )}
      >
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className={cn("flex flex-col items-start gap-5", brandSpan)}>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-sm transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <LogoMark />
              <span className="text-base font-semibold tracking-[-0.01em] text-foreground">
                Celestia
              </span>
            </Link>

            <p className="max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
              Enterprise software development for teams that need to move fast
              without breaking things. Web and mobile — shipped with the
              architecture to scale.
            </p>

            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon"
                  aria-label={label}
                  title={label}
                  className="size-8 rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                  render={<Link href={href} target="_blank" rel="noreferrer" />}
                >
                  <Icon className="size-4" weight="fill" aria-hidden />
                </Button>
              ))}
            </div>
          </div>

          <div className={cn("grid gap-x-6 gap-y-10", navCols, navSpan)}>
            {columns.map((column) => (
              <nav
                key={column.label}
                aria-label={column.label}
                className={cn(
                  "flex flex-col gap-3.5",
                  column.wide && "col-span-2 sm:col-span-1"
                )}
              >
                <p className="text-2xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {column.label}
                </p>
                <ul
                  className={cn(
                    column.wide
                      ? "grid grid-cols-2 gap-x-6 gap-y-2.5 sm:flex sm:flex-col sm:gap-2.5"
                      : "flex flex-col gap-2.5"
                  )}
                >
                  {column.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        {...(isExternal(item)
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        className="inline-flex items-center gap-1 rounded-sm text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {item.label}
                        {isExternal(item) ? (
                          <ArrowSquareOutIcon
                            className="size-3 text-muted-foreground"
                            aria-hidden
                          />
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Celestia. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

export interface SiteLayoutProps {
  children: ReactNode
  /** Extra classes on the root `<main>` (theme scopes, selection styles). */
  className?: string
  /** In-page anchors for the nav. Pass `[]` on pages without sections. */
  anchors?: readonly SiteLink[]
  showSurfaces?: boolean
  cta?: SiteLink | null
  /** Footer nav columns. Pass `{}` for brand + Explore only. */
  footerGroups?: Record<string, readonly SiteLink[]>
  /** Max width of the centered content column (`constrainContent` only). */
  contentMaxWidth?: string
  contentClassName?: string
  /**
   * Wrap children in the centered content column. Pages whose sections
   * manage their own containers pass `false` and render full-width of the
   * area the rail leaves open.
   */
  constrainContent?: boolean
  footerMaxWidth?: string
}

/**
 * The reusable site layout, extracted from the landing page: the two-shape
 * site nav (top bar below `lg`, fixed left rail from `lg`), a content area
 * that cedes the rail's 20rem via `lg:ml-80`, and the site footer.
 */
export function SiteLayout({
  children,
  className,
  anchors,
  showSurfaces,
  cta,
  footerGroups,
  contentMaxWidth = "max-w-[960px]",
  contentClassName,
  constrainContent = true,
  footerMaxWidth,
}: SiteLayoutProps) {
  return (
    <main className={cn("min-h-screen bg-background text-foreground scroll-smooth", className)}>
      <SiteNav anchors={anchors} showSurfaces={showSurfaces} cta={cta} />
      {/* Below lg the nav is a static top bar, so nothing offsets; from lg the
          rail is fixed and the page content cedes its 20rem. */}
      <div className="lg:ml-80">
        {constrainContent ? (
          <div
            className={cn(
              "mx-auto w-full px-5 sm:px-8",
              contentMaxWidth,
              contentClassName
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
        <SiteFooter groups={footerGroups} maxWidth={footerMaxWidth} />
      </div>
    </main>
  )
}
