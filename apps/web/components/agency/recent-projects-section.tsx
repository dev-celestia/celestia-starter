import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  DesktopIcon,
  GithubLogoIcon,
  LightningIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Badge, Button } from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

import { IconTile } from "./icon-tile"
import { SectionHeading } from "./section-heading"

const HIGHLIGHTS = [
  {
    icon: DesktopIcon,
    title: "Local-First Desktop Workspace",
    description:
      "A dedicated desktop toolkit for HTTP inspection, API testing, and security reconnaissance. Runs entirely on your machine with zero cloud dependency and no external latency.",
    tags: ["Desktop App", "macOS", "Windows", "Local-First"],
  },
  {
    icon: LightningIcon,
    title: "Live Interception & Replay",
    description:
      "Hold HTTP and HTTPS traffic mid-flight before it hits the target server. Rewrite payloads, modify headers, and reissue requests instantaneously with sub-millisecond proxy performance.",
    tags: ["MITM Proxy", "Request Replay", "Packet Mutation", "Sub-ms Latency"],
  },
  {
    icon: ShieldCheckIcon,
    title: "Security & Testing Suite",
    description:
      "Built-in desktop tools for automated vulnerability attacks with Intruder, token tampering with JWT Analyzer, active port scanning, and configurable API mock engines.",
    tags: ["Repeater", "Intruder", "JWT Analyzer", "API Mock"],
  },
]

/**
 * Hairline-rule grid matching Services and Process sections: each cell opens
 * with a top border and vertical padding, so the section reads as an index of
 * work rather than a tray of cards. The fourth cell closes with section actions.
 */
export function RecentProjectsSection() {
  return (
    <section id="projects" className="py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Recent Work"
          title="Featured Project: Hexbuffer"
          description="A local-first desktop workspace for HTTP traffic inspection, live request interception, and security research — built for speed, privacy, and zero cloud dependency."
        />
      </Reveal>

      <div className="reveal-stagger mt-10 grid gap-x-12 sm:grid-cols-2">
        {HIGHLIGHTS.map((item) => (
          <Reveal key={item.title} className="border-t border-border py-7">
            <IconTile icon={item.icon} />
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              {item.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">
              {item.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="secondary" size="sm" mono className="text-3xs">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}

        {/* Action cell leading to project destinations */}
        <Reveal className="border-t border-border py-7">
          <Badge variant="default" mono className="uppercase tracking-wider">
            Available Now
          </Badge>
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
            Try Hexbuffer on your next target
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">
            Install on macOS, point the proxy at your target, and start inspecting
            traffic in minutes. Open to feedback with Windows build in progress.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              className="gap-2 active:scale-[0.96] transition-transform"
              render={
                <Link
                  href="https://0xbuffer.com/"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Visit 0xbuffer.com
              <ArrowSquareOutIcon className="size-3.5" aria-hidden />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 active:scale-[0.96] transition-transform"
              render={
                <Link
                  href="https://0xbuffer.com/downloads"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Downloads
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground active:scale-[0.96] transition-transform"
              render={
                <Link
                  href="https://github.com/dev-celestia/hexbuffer"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <GithubLogoIcon className="size-4" aria-hidden />
              GitHub
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
