import { Reveal } from "./reveal"

const STACK = [
  {
    name: "Authentication",
    tag: "better-auth",
    description:
      "Email/password, Google OAuth, and 2FA. Sessions live in PostgreSQL, handled by Better Auth on the backend.",
  },
  {
    name: "Typed API",
    tag: "hono-rpc",
    description:
      "Hono routes with an RPC client — call the backend from React with end-to-end types and no codegen.",
  },
  {
    name: "Data layer",
    tag: "drizzle",
    description:
      "Drizzle ORM over PostgreSQL in a shared workspace package. Type-safe from schema to query.",
  },
  {
    name: "Feature installer",
    tag: "feature-manager",
    description:
      "pnpm add-feature <name> copies templates, wires imports, installs dependencies. Removing is one command too.",
  },
  {
    name: "Documentation",
    tag: "fumadocs",
    description:
      "A Fumadocs site, pre-wired with search, MDX pages, and LLM-friendly text endpoints.",
  },
  {
    name: "Monorepo",
    tag: "turborepo",
    description:
      "Turborepo pipeline and pnpm workspaces. UI, configs, and types shared across apps without duplication.",
  },
]

export function StackSection() {
  return (
    <section id="stack" className="mx-auto w-full max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal>
          <h2 className="text-3xl tracking-[-0.02em] text-balance sm:text-4xl">
            The box comes full
          </h2>
          <p className="mt-5 max-w-md text-fog leading-relaxed">
            Every piece is a package you can open and read. Nothing is
            generated behind a service, and nothing you remove leaves a hole.
          </p>
        </Reveal>

        <div className="reveal-stagger">
          {STACK.map((item) => (
            <Reveal key={item.tag}>
              <div className="group grid gap-1 border-t border-stroke py-6 transition-colors duration-300 last:border-b hover:bg-surface/60 motion-reduce:transition-none sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-6 sm:px-4">
                <h3 className="font-medium text-text-primary">
                  {item.name}
                </h3>
                <p className="text-sm leading-relaxed text-fog">
                  {item.description}
                </p>
                <span className="font-mono text-xs text-fog/80 transition-colors group-hover:text-[#89aacc]">
                  {item.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
