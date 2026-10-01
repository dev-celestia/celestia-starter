import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@celestia-project/ui"

import { SectionHeading } from "@/components/agency/section-heading"

import { Reveal } from "./reveal"
import { InstallTerminal } from "./terminal"

const GUARANTEES = [
  "Features are optional — auth, dashboard, blog",
  "Dependencies and env vars keyed per package",
  "Git initialized on the last step",
]

/**
 * Text beside the terminal, in the contact section's split: SectionHeading
 * with the checklist beneath it, the scaffold session on the right.
 */
export function InstallSection() {
  return (
    <section id="install" className="py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Get started"
            title="From npx to pnpm dev"
            description="One command clones the template, then walks you through the rest: pick features, write env files, install dependencies, push the schema. You land in a repository you already understand."
          />

          <ItemGroup className="mt-8 gap-2">
            {GUARANTEES.map((guarantee) => (
              <Item key={guarantee} size="xs" className="p-0">
                <ItemMedia variant="icon" className="text-primary">
                  <CheckCircleIcon className="size-4" weight="fill" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-none text-sm font-normal text-muted-foreground">
                    {guarantee}
                  </ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </Reveal>

        <Reveal>
          <InstallTerminal />
        </Reveal>
      </div>
    </section>
  )
}
