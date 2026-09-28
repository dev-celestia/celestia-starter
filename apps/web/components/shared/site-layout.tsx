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
  { icon: GithubLogoIcon, href: "https://github.com/dev-celestia", label: "GitHub" },
  { icon: LinkedinLogoIcon, href: "#", label: "LinkedIn" },
  { icon: XLogoIcon, href: "#", label: "X / Twitter" },
]

const LEGAL = ["Privacy Policy", "Terms of Service", "Cookie Policy"]

interface SiteFooterProps {
  /** Extra nav columns between the brand and Explore groups. */
  groups?: Record<string, readonly SiteLink[]>
  /** Max width of the footer's content column. */
  maxWidth?: string
}

/**
 * The site footer: brand column with socials, optional nav groups, the
 * Explore group (mirrors the rail on lg+ and is the only place mobile
 * users see the surfaces), then the legal row. Its content column owns
 * the same width as the page sections, so their alignment edges match
 * while the footer's border runs the full width the rail leaves open.
 */
function SiteFooter({
  groups = AGENCY_FOOTER_GROUPS,
  maxWidth = "max-w-[960px]",
}: SiteFooterProps) {
  return (
    <footer className="border-t border-border bg-background">
      <div className={cn("mx-auto w-full px-5 py-16 sm:px-8", maxWidth)}>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                Celestia
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Enterprise software development for teams that need to move fast
              without breaking things. Web and mobile — shipped with the
              architecture to scale.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="icon-sm"
                  aria-label={label}
                  render={<Link href={href} target="_blank" rel="noreferrer" />}
                >
                  <Icon className="size-4" weight="fill" />
                </Button>
              ))}
            </div>
          </div>

          {Object.entries(groups).map(([group, items]) =>
            items.length > 0 ? (
              <nav key={group} aria-label={group} className="flex flex-col gap-3">
                <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  {group}
                </p>
                <ul className="flex flex-col gap-2">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground rounded-sm text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null
          )}

          <nav aria-label="Explore" className="flex flex-col gap-3">
            <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
              Explore
            </p>
            <ul className="flex flex-col gap-2">
              {LANDING_SURFACES.map((surface) => (
                <li key={surface.label}>
                  <Link
                    href={surface.href}
                    {...(surface.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-sm text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {surface.label}
                    {surface.external || surface.href.startsWith("http") ? (
                      <ArrowSquareOutIcon className="size-3" aria-hidden />
                    ) : null}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-sm text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  GitHub
                  <ArrowSquareOutIcon className="size-3" aria-hidden />
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-muted-foreground font-mono text-xs">
            © {new Date().getFullYear()} Celestia. All rights reserved.
          </p>
          <div className="flex gap-5">
            {LEGAL.map((item) => (
              <Link
                key={item}
                href="#"
                className="text-muted-foreground hover:text-foreground rounded-sm text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item}
              </Link>
            ))}
          </div>
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
