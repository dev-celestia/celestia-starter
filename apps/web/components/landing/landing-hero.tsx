import Link from "next/link"
import {
  ArrowRightIcon,
  BookOpenIcon,
  LightningIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Badge, Button, Separator } from "@celestia-project/ui"

import { CommandBar } from "./command-bar"
import { TRUST_ITEMS } from "./content"

export function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-inner container">
        <div className="landing-hero-copy">
          <Badge variant="outline" size="default">
            <ShieldCheckIcon />
            Type-safe end to end · No server code in the UI
          </Badge>

          <h1 className="landing-title landing-title-hero">
            Two apps, one typed contract,{" "}
            <span className="landing-accent landing-accent-block">
              zero glue code.
            </span>
          </h1>

          <p className="landing-lede landing-hero-lede">
            Celestia is a decoupled full-stack starter: a Next.js 16 frontend
            that never touches the database, a Hono backend that owns it, and a
            shared contract between them that the compiler checks. Auth,
            dashboard, blog, CMS and media arrive as features you install with
            one command.
          </p>
        </div>

        <CommandBar />

        <div className="landing-hero-actions">
          {/* `nativeButton={false}` on every anchor render — see LandingNav. */}
          <Button
            variant="default"
            size="lg"
            nativeButton={false}
            render={<Link href="/docs" />}
          >
            Read the architecture
            <ArrowRightIcon />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            nativeButton={false}
            render={<a href="#architecture" />}
          >
            <BookOpenIcon />
            See a request trace
          </Button>
        </div>

        <div className="landing-hero-note">
          <span className="landing-hero-note-item">
            <LightningIcon />
            <span className="landing-mono">7</span> features installable in one
            command
          </span>
          <span className="landing-hero-note-item">
            Docs served at <span className="landing-mono">/docs</span>
          </span>
          <span className="landing-hero-note-item">
            MIT licensed · no account required
          </span>
        </div>

        <Separator />

        <div className="landing-trust">
          <span className="landing-trust-label">Runs on</span>
          {TRUST_ITEMS.map((item) => (
            <span key={item.name} className="landing-trust-item">
              {item.name}
              <span className="landing-trust-kind">{item.kind}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
