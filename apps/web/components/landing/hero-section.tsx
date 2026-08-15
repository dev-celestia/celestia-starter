import Link from "next/link"
import { Button } from "@celestia-project/ui"

import { CopyCommand } from "./copy-command"
import { HeroVideo } from "./hero-video"

export function HeroSection() {
  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
      <HeroVideo />

      <div className="hero-stagger relative z-10 mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <p className="font-mono text-[13px] text-fog">
          <span className="mr-2 inline-block size-1.5 rounded-full align-middle accent-gradient" />
          <span>celestia-starter · production-ready</span>
        </p>

        <h1 className="mt-6 text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[1.04] tracking-[-0.03em] text-balance">
          The production stack, installed in one command.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-fog text-pretty sm:text-lg">
          Celestia is a full-stack monorepo starter with a real architecture:
          a Next.js 16 frontend that stays pure UI, a Hono backend that owns
          auth and data, and a feature installer so you only carry what you
          use.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/sign-up">
            <Button variant="default" size="lg">
              Demo Template
            </Button>
          </Link>
          <CopyCommand />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden
        className="hero-scroll absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-9 w-[22px] items-start justify-center overflow-hidden rounded-full border border-stroke bg-bg/40 p-1 backdrop-blur-sm">
          <span className="block h-2.5 w-[3px] rounded-full bg-[#89aacc] animate-scroll-down" />
        </div>
      </div>
    </section>
  )
}
