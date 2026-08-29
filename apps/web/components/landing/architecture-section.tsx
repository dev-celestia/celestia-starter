import { Reveal } from "./reveal"

export function ArchitectureSection() {
  return (
    <section
      id="architecture"
      className="border-y border-stroke bg-surface/40"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
        <Reveal>
          <h2 className="max-w-2xl text-3xl tracking-[-0.02em] text-balance sm:text-4xl">
            Two apps. One boundary. Enforced by structure
          </h2>
          <p className="mt-5 max-w-2xl text-fog leading-relaxed">
            The frontend never touches the database. The backend never
            renders a pixel. Requests cross the boundary only through the{" "}
            <code className="font-mono text-sm text-text-primary">
              /api/*
            </code>{" "}
            rewrite — so secrets stay server-side by construction, not by
            convention.
          </p>
        </Reveal>

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-[1fr_5.5rem_1fr]">
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-xl border border-stroke bg-bg p-8">
              <p className="font-mono text-xs text-fog">apps/web</p>
              <h3 className="mt-3 text-xl tracking-[-0.01em]">
                Pure UI
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-fog">
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-stroke" />
                  <span>
                    Next.js 16 App Router — pages, components, client-side
                    auth only
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-stroke" />
                  <span>No database access, no server secrets, ever</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-stroke" />
                  <span>Talks to the API through the same-origin proxy</span>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Boundary */}
          <div aria-hidden className="hidden items-center justify-center lg:flex">
            <div className="relative h-full w-px bg-stroke">
              <span className="absolute top-1/2 inset-inline-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-stroke bg-bg px-3 py-1 font-mono text-xs whitespace-nowrap text-fog">
                /api/*
              </span>
              <span className="absolute top-1/2 inset-inline-1/2 size-2 -translate-x-1/2 translate-y-8 rounded-full accent-gradient animate-pulse" />
            </div>
          </div>
          <div aria-hidden className="flex justify-center lg:hidden">
            <span className="rounded-full border border-stroke bg-bg px-3 py-1 font-mono text-xs text-fog">
              /api/*
            </span>
          </div>

          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-xl border border-stroke bg-bg p-8">
              <p className="font-mono text-xs text-fog">apps/api</p>
              <h3 className="mt-3 text-xl tracking-[-0.01em]">
                Owns the truth
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-fog">
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-stroke" />
                  <span>
                    Hono server on port 4000 — business logic and CRUD
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-stroke" />
                  <span>Better Auth server — sessions, OAuth, 2FA</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-stroke" />
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
