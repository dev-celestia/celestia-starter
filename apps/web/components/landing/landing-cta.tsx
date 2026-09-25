import Link from "next/link"
import { ArrowRightIcon, StackIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@celestia-project/ui"

export function LandingCta() {
  return (
    <section className="section-tight">
      <div className="container">
        <div className="landing-cta">
          <div className="landing-cta-inner">
            <span className="landing-eyebrow">Get started</span>
            <h2 className="landing-title landing-title-section">
              Scaffold a project, then read the code it wrote
            </h2>
            <p className="landing-lede landing-hero-lede">
              One command stands up the frontend, the backend, the shared
              packages and the docs site. Start the stack and you have a typed,
              authenticated, documented monorepo to build on — not a blank
              folder.
            </p>
            <div className="landing-cta-actions">
              {/* `nativeButton={false}` — see LandingNav for why. */}
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
                render={<Link href="/feature-installer" />}
              >
                <StackIcon />
                See the feature installer
              </Button>
            </div>
            <span className="landing-hero-note-item">
              MIT licensed · no account required · 7 features ready to install
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
