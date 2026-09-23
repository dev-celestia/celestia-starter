import Link from "next/link"
import { GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { Button, Separator } from "@celestia-project/ui"

import { LogoMark } from "@/components/shared/logo-mark"

/**
 * Two distinct groups. The previous pair of columns both opened with
 * "Services", so the footer listed the same destination twice while omitting
 * the case studies and process sections entirely.
 */
const LINKS = {
  Company: [
    { label: "Services", href: "#services" },
    { label: "Case Studies", href: "#case-studies" },
    { label: "How We Work", href: "#process" },
    { label: "Tech Stack", href: "#tech-stack" },
  ],
  Engagement: [
    { label: "Dedicated Squads", href: "#engagement-models" },
    { label: "Time & Materials", href: "#engagement-models" },
    { label: "Fixed Price", href: "#engagement-models" },
    { label: "Book a Consultation", href: "#contact" },
  ],
}

const SOCIALS = [
  { icon: GithubLogoIcon, href: "https://github.com/dev-celestia", label: "GitHub" },
  { icon: LinkedinLogoIcon, href: "#", label: "LinkedIn" },
  { icon: XLogoIcon, href: "#", label: "X / Twitter" },
]

const LEGAL = ["Privacy Policy", "Terms of Service", "Cookie Policy"]

export function AgencyFooter() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4 sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                Celestia
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Enterprise software development for teams that need to move fast
              without breaking things. Web, mobile, cloud — shipped with the
              architecture to scale.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="icon-sm"
                  aria-label={label}
                  render={<Link href={href} target="_blank" rel="noreferrer" />}
                >
                  <Icon className="size-4" weight="fill" />
                </Button>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([group, items]) => (
            <nav key={group} aria-label={group} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {group}
              </p>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} Celestia. All rights reserved.
          </p>
          <div className="flex gap-5">
            {LEGAL.map((item) => (
              <Link
                key={item}
                href="#"
                className="rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
