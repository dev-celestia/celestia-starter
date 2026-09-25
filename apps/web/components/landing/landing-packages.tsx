import {
  ArrowsClockwiseIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Badge, Separator } from "@celestia-project/ui"

import { getIcon } from "./icons"
import { PACKAGE_CARDS } from "./content"

export function LandingPackages() {
  return (
    <section className="section" id="packages">
      <div className="stack-lg container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Workspace layout</span>
          <h2 className="landing-title landing-title-section">
            Two apps, six packages, one job each
          </h2>
          <p className="landing-lede">
            Every directory has a single responsibility and a single owner. The
            web app renders, the API decides, the database package defines the
            shape of the data, and the UI package defines what it looks like.
          </p>
        </div>

        <div className="grid-auto">
          {PACKAGE_CARDS.map((entry) => {
            const Icon = getIcon(entry.icon)
            return (
              <article key={entry.name} className="landing-card">
                <div className="cluster-between">
                  <span className="landing-card-icon">
                    <Icon />
                  </span>
                  <Badge variant="success">
                    <CheckCircleIcon />
                    Wired
                  </Badge>
                </div>

                <h3 className="landing-card-title landing-mono">
                  {entry.name}
                </h3>
                <p className="landing-body">{entry.body}</p>

                <Separator />

                <div className="landing-card-meta">
                  <span className="landing-mono">{entry.detail}</span>
                  <span className="row-xs">
                    <ArrowsClockwiseIcon />
                    {entry.cadence}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
