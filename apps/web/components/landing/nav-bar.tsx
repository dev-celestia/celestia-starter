"use client"

import Link from "next/link"
import * as React from "react"
import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  GithubLogoIcon,
  TriangleDashedIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

const GITHUB_URL = "https://github.com/celestia-realm/celestia-starter"

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
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        scrolled
          ? "border-b border-stroke/80 bg-bg/85 backdrop-blur-xl"
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
          className="flex items-center gap-2.5 text-text-primary transition-opacity hover:opacity-90 active:scale-[0.98] motion-reduce:active:scale-100"
        >
          <LogoMark />
          <span className="text-[15px] tracking-[-0.01em]">
            Celestia
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer">
                  <span>Products</span>
                  <CaretDownIcon className="size-3 text-muted-foreground transition-transform duration-200" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-68 p-1.5">
              <DropdownMenuItem
                render={
                  <Link
                    href="https://0xbuffer.com/"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                className="cursor-pointer items-start gap-2.5 p-2"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <TriangleDashedIcon className="size-3.5" weight="bold" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs text-foreground">Hexbuffer</span>
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 text-[9px] font-mono border-amber-500/30 bg-amber-500/10 text-amber-300"
                    >
                      ALPHA
                    </Badge>
                    <ArrowSquareOutIcon className="size-3 ml-auto text-muted-foreground shrink-0" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Modern security & application toolkit
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/design-system">
            <Button variant="ghost" size="sm">
              Design System
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="ghost" size="sm">
              Docs
            </Button>
          </Link>

          <Link href={GITHUB_URL} target="_blank" rel="noreferrer" className="ml-4 -mt-0.5">
            <Button
              variant="default"
              size="sm"
              aria-label="Star on GitHub"
            >
              <GithubLogoIcon className="size-3.5" weight="fill" />
              Star on Github
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
