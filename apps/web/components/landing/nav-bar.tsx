"use client"

import Link from "next/link"
import * as React from "react"
import { WarningIcon } from "@phosphor-icons/react"
import { Button } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

const LINKS: {
  href: string
  label: string
  external?: boolean
}[] = [
  { href: "/components", label: "Components" },
  { href: "#stack", label: "Stack" },
  { href: "#architecture", label: "Architecture" },
  { href: "#install", label: "Install" },
  {
    href: "/docs",
    label: "Docs",
  },
]

const GITHUB_URL = "https://github.com/celestia-realm/celestia-starter"

function GithubIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <title>GitHub</title>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.66.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

export function LogoMark({ className }: Readonly<{ className?: string }>) {
  return (
    <span
      aria-hidden
      className={cn(
        "accent-gradient grid size-7 place-items-center rounded-full",
        className,
      )}
    >
      <span className="grid size-[22px] place-items-center rounded-full">
        <span className="size-1.5 rounded-full bg-[#89aacc]" />
      </span>
    </span>
  )
}

export function NavBar() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 motion-reduce:transition-none",
        scrolled
          ? "border-b border-stroke bg-bg/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/* Active Development Warning Bar */}
      <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-xs text-amber-200/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
          <WarningIcon className="size-4 shrink-0 text-amber-400" />
          <span>
            <strong className="font-medium text-amber-300">Under Active Development:</strong> Features are undergoing testing and refinement.
          </span>
        </div>
      </div>

      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text-primary"
        >
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">
            Celestia Starter
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              {...(link.external && { target: "_blank", rel: "noreferrer" })}
              className="text-sm text-fog transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
            <Button
              variant="ghost"
              size="lg"
              aria-label="Star on GitHub"
            >
              <GithubIcon className="size-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              variant="ghost"
              size="lg"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="default" size="lg">
              Get started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
