import { Reveal } from "./reveal"

export function ArchitectureSection() {
  return (
    <section
      id="architecture"
      className="border-y border-border bg-muted/30"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
        <Reveal>
          <h2 className="max-w-2xl text-3xl tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            Two apps. One boundary. Enforced by structure
          </h2>
          <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">
            The frontend never touches the database. The backend never
            renders a pixel. Requests cross the boundary only through the{" "}
            <code className="font-mono text-sm text-foreground">
              /api/*
            </code>{" "}
            rewrite — so secrets stay server-side by construction, not by
            convention.
          </p>
        </Reveal>

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-[1fr_5.5rem_1fr]">
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-8">
              <p className="font-mono text-xs text-muted-foreground">apps/web</p>
              <h3 className="mt-3 text-xl tracking-[-0.01em] text-foreground">
                Pure UI
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-border" />
                  <span>
                    Next.js 16 App Router — pages, components, client-side
                    auth only
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-border" />
                  <span>No database access, no server secrets, ever</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-border" />
                  <span>Talks to the API through the same-origin proxy</span>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Boundary */}
          <div aria-hidden className="hidden items-center justify-center lg:flex">
            <div className="relative h-full w-px bg-border">
              <span className="absolute top-1/2 inset-inline-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs whitespace-nowrap text-muted-foreground">
                /api/*
              </span>
              <span className="absolute top-1/2 inset-inline-1/2 size-2 -translate-x-1/2 translate-y-8 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
          <div aria-hidden className="flex justify-center lg:hidden">
            <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
              /api/*
            </span>
          </div>

          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-8">
              <p className="font-mono text-xs text-muted-foreground">apps/api</p>
              <h3 className="mt-3 text-xl tracking-[-0.01em] text-foreground">
                Owns the truth
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-border" />
                  <span>
                    Hono server on port 4000 — business logic and CRUD
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-border" />
                  <span>Better Auth server — sessions, OAuth, 2FA</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-border" />
                  <span>Drizzle ORM — the only code that talks to PostgreSQL</span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
