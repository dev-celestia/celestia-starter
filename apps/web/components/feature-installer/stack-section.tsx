import {
  ArrowsLeftRightIcon,
  DatabaseIcon,
  LockKeyIcon,
  PackageIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Badge } from "@celestia-project/ui"

import { IconTile } from "@/components/agency/icon-tile"
import { SectionHeading } from "@/components/agency/section-heading"

import { CopyCommand } from "./copy-command"
import { Reveal } from "./reveal"

const STACK = [
  {
    icon: LockKeyIcon,
    name: "Authentication",
    tag: "better-auth",
    description:
      "Email/password, Google OAuth, and 2FA. Sessions live in PostgreSQL, handled by Better Auth on the backend.",
  },
  {
    icon: ArrowsLeftRightIcon,
    name: "Typed API",
    tag: "hono-rpc",
    description:
      "Hono routes with an RPC client — call the backend from React with end-to-end types and no codegen.",
  },
  {
    icon: DatabaseIcon,
    name: "Data layer",
    tag: "drizzle",
    description:
      "Drizzle ORM over PostgreSQL in a shared workspace package. Type-safe from schema to query.",
  },
  {
    icon: PackageIcon,
    name: "Feature installer",
    tag: "feature-manager",
    description:
      "pnpm add-feature <name> copies templates, wires imports, installs dependencies. Removing is one command too.",
  },
  {
    icon: TreeStructureIcon,
    name: "Monorepo",
    tag: "turborepo",
    description:
      "Turborepo pipeline and pnpm workspaces. UI, configs, and types shared across apps without duplication.",
  },
]

/**
 * The landing's hairline-rule grid: each cell opens with a top border and
 * carries an IconTile with its package tag opposite, so the section reads as
 * an index of what ships rather than a tray of cards. The sixth cell closes
 * with the section's ask — the install command itself.
 */
export function StackSection() {
  return (
    <section id="stack" className="py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="The stack"
          title="The box comes full"
          description="Every piece is a package you can open and read. Nothing is generated behind a service, and nothing you remove leaves a hole."
        />
      </Reveal>

      <div className="reveal-stagger mt-10 grid gap-x-12 sm:grid-cols-2">
        {STACK.map((item) => (
          <Reveal key={item.tag} className="border-t border-border py-7">
            <div className="flex items-center justify-between">
              <IconTile icon={item.icon} />
              <Badge variant="secondary" size="sm" mono className="text-3xs">
                {item.tag}
              </Badge>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              {item.name}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">
              {item.description}
            </p>
          </Reveal>
        ))}

        {/* The one cell that asks for something, so it leads the eye. */}
        <Reveal className="border-t border-border py-7">
          <Badge variant="default" mono className="uppercase tracking-wider">
            One command
          </Badge>
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
            Install the whole stack
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">
            Clones the template, then walks you through feature selection, env
            files, and the schema push. Removing a feature later is one command
            too.
          </p>
          <div className="mt-6 max-w-sm">
            <CopyCommand />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
