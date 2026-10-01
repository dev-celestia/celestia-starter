import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@celestia-project/ui"

import { SectionHeading } from "@/components/agency/section-heading"

import { Reveal } from "./reveal"

/**
 * The closing ask, in the landing's voice: hairline top edge, start-aligned
 * heading and actions — no centered poster band, which no other page has.
 */
export function CtaSection() {
  return (
    <section className="border-t border-border py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Start building"
          title="Start from architecture, not setup."
          description="Create an account and take the dashboard for a spin, or run the installer and make it yours."
        />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button className="gap-2" render={<Link href="/sign-up" />}>
            Demo Template
            <ArrowRightIcon className="size-4" aria-hidden />
          </Button>
          <Button variant="secondary" render={<Link href="/docs" />}>
            Documentation
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
