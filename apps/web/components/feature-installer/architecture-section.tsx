import {
  BrowserIcon,
  CheckIcon,
  HardDrivesIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Badge } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

import { IconTile } from "@/components/agency/icon-tile"
import { SectionHeading } from "@/components/agency/section-heading"

import { Reveal } from "./reveal"

const APPS = [
  {
    path: "apps/web",
    icon: BrowserIcon,
    title: "Pure UI",
    points: [
      "Next.js 16 App Router — pages, components, client-side auth only",
      "No database access, no server secrets, ever",
      "Talks to the API through the same-origin proxy",
    ],
  },
  {
    path: "apps/api",
    icon: HardDrivesIcon,
    title: "Owns the truth",
    points: [
      "Hono server on port 4000 — business logic and CRUD",
      "Better Auth server — sessions, OAuth, 2FA",
      "Drizzle ORM — the only code that talks to PostgreSQL",
    ],
  },
]

/**
 * The boundary diagram, dressed in the landing's idiom: SectionHeading on
 * top, then two bordered panels with IconTile headers and a hairline between
 * them carrying the /api/* pill — the page's one diagram, kept because a
 * two-column grid of cards cannot say "requests cross here" on its own.
 */
export function ArchitectureSection() {
  return (
    <section id="architecture" className="py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Architecture"
          title="Two apps. One boundary. Enforced by structure"
          description="The frontend never touches the database. The backend never renders a pixel. Requests cross the boundary only through the /api/* rewrite — so secrets stay server-side by construction, not by convention."
        />
      </Reveal>

      <div className="reveal-stagger mt-10 grid items-stretch gap-6 lg:grid-cols-[1fr_5.5rem_1fr]">
        {APPS.map((app, index) => (
          <Reveal
            key={app.path}
            // Explicit placement: panels take columns 1 and 3, leaving the
            // hairline column between them. `order` keeps the mobile pill
            // between the two stacked panels (auto-placement follows it);
            // on lg every child's position is explicit, so order is moot.
            className={cn(
              "h-full",
              index === 0 ? "order-1 lg:col-start-1" : "order-3 lg:col-start-3",
              "lg:row-start-1",
            )}
          >
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <IconTile icon={app.icon} />
                <Badge variant="outline" mono className="text-3xs">
                  {app.path}
                </Badge>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                {app.title}
              </h3>
              <ul className="mt-6 space-y-3.5 text-sm leading-relaxed text-muted-foreground">
                {app.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <CheckIcon
                      className="mt-1 size-3.5 shrink-0 text-primary"
                      weight="bold"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}

        {/* The boundary itself — a hairline with the proxy pill on it. */}
        <div
          aria-hidden
          className="hidden items-center justify-center lg:col-start-2 lg:row-start-1 lg:flex"
        >
          <div className="relative h-full w-px bg-border">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs whitespace-nowrap text-muted-foreground">
              /api/*
            </span>
            <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 translate-y-8 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
        <div
          aria-hidden
          className="order-2 flex justify-center lg:hidden"
        >
          <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
            /api/*
          </span>
        </div>
      </div>
    </section>
  )
}
