import { CheckCircleIcon, LockIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge, Separator } from "@celestia-project/ui"

import { getIcon } from "./icons"
import { BOUNDARY_CHECKS, BOUNDARY_RULES } from "./content"

export function LandingBoundaries() {
  return (
    <section className="section" id="boundaries">
      <div className="stack-lg container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">The frontend / backend split</span>
          <h2 className="landing-title landing-title-section">
            The boundary is enforced, not documented
          </h2>
          <p className="landing-lede">
            A separated architecture only survives if something checks it. Here
            the rules are mechanical: the web app has no route to the database,
            no auth server, and no secret — and the build fails if that changes.
          </p>
        </div>

        <div className="grid-auto">
          {BOUNDARY_RULES.map((rule) => {
            const Icon = getIcon(rule.icon)
            return (
              <article key={rule.title} className="landing-card">
                <span className="landing-card-icon">
                  <Icon />
                </span>
                <h3 className="landing-card-title">{rule.title}</h3>
                <p className="landing-body">{rule.body}</p>
              </article>
            )
          })}
        </div>

        <div className="landing-panel">
          <div className="landing-panel-bar">
            <span className="row-xs">
              <LockIcon />
              <span className="landing-card-title">
                Architecture boundary check
              </span>
            </span>
            <span className="landing-card-meta">
              <span className="landing-mono">
                runs in CI · non-zero exit on violation
              </span>
            </span>
          </div>

          <div className="landing-panel-body stack">
            {BOUNDARY_CHECKS.map((check) => (
              <div key={check.rule} className="cluster-between">
                <span className="row-sm">
                  <Badge variant="outline" mono>
                    {check.rule}
                  </Badge>
                  <span className="landing-body">{check.subject}</span>
                </span>

                <span className="landing-card-meta">
                  <span>{check.actor}</span>
                  <Badge variant="secondary" mono>
                    {check.scope}
                  </Badge>
                  {check.outcome === "PASS" ? (
                    <Badge variant="success">
                      <CheckCircleIcon />
                      PASS
                    </Badge>
                  ) : (
                    <Badge variant="destructive">BLOCKED</Badge>
                  )}
                </span>
              </div>
            ))}
            <Separator />
            <p className="landing-body">
              The last row is the shape of a violation worth catching: importing
              the shared database package into a client component compiles,
              runs, and silently drops every server type along the way. The
              check stops it at the pull request instead.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
