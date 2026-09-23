import Link from "next/link"
import { GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { Button, Separator } from "@celestia-project/ui"

import { LogoMark } from "@/components/shared/logo-mark"

const LINKS = {
  Services: [
    { label: "Custom Software", href: "#services" },
    { label: "Mobile Apps", href: "#services" },
    { label: "Cloud & DevOps", href: "#services" },
    { label: "Dedicated Teams", href: "#services" },
  ],
  Company: [
    { label: "Services", href: "#services" },
    { label: "How We Work", href: "#process" },
    { label: "Engagement Models", href: "#about" },
    { label: "Tech Stack", href: "#tech-stack" },
    { label: "Contact", href: "#contact" },
  ],
}

const SOCIALS = [
  { icon: GithubLogoIcon, href: "https://github.com/dev-celestia", label: "GitHub" },
  { icon: LinkedinLogoIcon, href: "#", label: "LinkedIn" },
  { icon: XLogoIcon, href: "#", label: "X / Twitter" },
]

export function AgencyFooter() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-2">
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

          {/* Links */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {group}
              </p>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} Celestia. All rights reserved.
          </p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
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
