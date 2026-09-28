import Link from "next/link"
import {
  ArrowSquareOutIcon,
  ArrowsLeftRightIcon,
  GithubLogoIcon,
  PackageIcon,
  PaletteIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Badge, Button } from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

import { IconTile } from "./icon-tile"
import { SectionHeading } from "./section-heading"

const OS_PROJECTS = [
  {
    id: "hexbuffer-proxy",
    title: "hexbuffer-proxy",
    icon: ArrowsLeftRightIcon,
    eyebrow: "Rust Crate · v1.0.0",
    description:
      "An HTTPS MITM proxy engine written in Rust. Intercepts encrypted traffic by dynamically generating on-the-fly TLS certificates for target domains, built on Hyper and Tokio.",
    tags: ["Rust", "MITM Proxy", "TLS Forging", "crates.io", "MIT License"],
    command: "cargo add hexbuffer-proxy",
    primaryLink: {
      label: "View on GitHub",
      href: "https://github.com/dev-celestia/hexbuffer-proxy",
      icon: GithubLogoIcon,
    },
    secondaryLink: {
      label: "crates.io",
      href: "https://crates.io/crates/hexbuffer-proxy",
      icon: PackageIcon,
    },
  },
  {
    id: "celestia-ui",
    title: "@celestia-project/ui",
    icon: PaletteIcon,
    eyebrow: "Design System · v0.4.0",
    description:
      "React component primitives built on Base UI and Tailwind CSS v4. Complete design system shipping 60+ accessible headless primitives, data tables, and dark-mode tokens.",
    tags: ["React 19", "Tailwind CSS v4", "Base UI", "npm", "MIT License"],
    command: "pnpm add @celestia-project/ui",
    primaryLink: {
      label: "npm Package",
      href: "https://www.npmjs.com/package/@celestia-project/ui",
      icon: PackageIcon,
    },
    secondaryLink: {
      label: "GitHub Repo",
      href: "https://github.com/dev-celestia/celestia-starter",
      icon: GithubLogoIcon,
    },
  },
]

/**
 * Hairline-rule grid matching Services, Process, and Recent Projects: each cell opens
 * with a top border and vertical padding, removing boxed card surfaces.
 */
export function OpenSourceSection() {
  return (
    <section id="open-source" className="py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Open Source"
          title="Tools built for the developer community"
          description="We engineer open infrastructure in public. From low-level Rust networking crates to accessible React component systems, our open-source tools power production software."
        />
      </Reveal>

      <div className="reveal-stagger mt-10 grid gap-x-12 sm:grid-cols-2">
        {OS_PROJECTS.map((project) => (
          <Reveal key={project.id} className="border-t border-border py-7">
            <div className="flex items-center justify-between">
              <IconTile icon={project.icon} />
              <Badge variant="outline" mono className="text-3xs uppercase">
                {project.eyebrow}
              </Badge>
            </div>

            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              {project.title}
            </h3>

            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">
              {project.description}
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 font-mono text-xs text-muted-foreground">
              <span className="select-none text-primary">$</span>
              <span className="text-foreground">{project.command}</span>
            </div>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="secondary" size="sm" mono className="text-3xs">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                className="gap-2 active:scale-[0.96] transition-transform"
                render={
                  <Link
                    href={project.primaryLink.href}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <project.primaryLink.icon className="size-3.5" aria-hidden />
                {project.primaryLink.label}
                <ArrowSquareOutIcon className="size-3 text-primary-foreground/80" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 active:scale-[0.96] transition-transform"
                render={
                  <Link
                    href={project.secondaryLink.href}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <project.secondaryLink.icon className="size-3.5" aria-hidden />
                {project.secondaryLink.label}
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
