import Link from "next/link"
import { Button } from "@celestia-project/ui"

import { LogoMark } from "./nav-bar"
import { Reveal } from "./reveal"

export function CtaSection() {
  return (
    <section className="border-t border-stroke">
      <div className="mx-auto w-full max-w-4xl px-5 py-28 text-center sm:px-8 sm:py-36">
        <Reveal>
          <LogoMark className="mx-auto" />
          <h2 className="mt-8 text-3xl tracking-[-0.02em] text-balance sm:text-5xl">
            Start from architecture, not setup.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-fog leading-relaxed">
            Create an account and take the dashboard for a spin, or run the
            installer and make it yours.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/docs">
              <Button variant="default" size="lg">
                Documentation
              </Button>
            </Link>
            <Link href="/components">
              <Button variant="outline" size="lg">
                Components UI
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
