import { CheckCircleIcon, TerminalIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge, Separator } from "@celestia-project/ui"

import { LEDGER_ENTRIES, LIFECYCLE_STEPS } from "./content"

export function LandingLifecycle() {
  return (
    <section className="section" id="lifecycle">
      <div className="stack-lg container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Feature manager</span>
          <h2 className="landing-title landing-title-section">
            Adding a feature is a command, not a merge
          </h2>
          <p className="landing-lede">
            Features are packages under packages/feature-manager/features/
            with a manifest describing what they copy and which markers they
            edit. Installing one is transactional, previewable, and reversible.
          </p>
        </div>

        <div className="grid-auto-sm">
          {LIFECYCLE_STEPS.map((step) => (
            <article key={step.index} className="landing-step">
              <span className="landing-step-index">{step.index}</span>
              <h3 className="landing-card-title">{step.title}</h3>
              <p className="landing-body">{step.body}</p>
            </article>
          ))}
        </div>

        <div className="landing-panel">
          <div className="landing-panel-bar">
            <span className="row-xs">
              <TerminalIcon />
              <span className="landing-card-title">Feature ledger</span>
            </span>
            <Badge variant="success">
              <CheckCircleIcon />7 installed
            </Badge>
          </div>

          <div className="landing-panel-body stack">
            {LEDGER_ENTRIES.map((entry) => (
              <div key={entry.name} className="cluster-between">
                <span className="landing-card-title landing-mono">
                  {entry.name}
                </span>
                <span className="landing-card-meta">
                  <span className="landing-mono">{entry.version}</span>
                  <span>installed {entry.installedAt}</span>
                  <Badge variant="success">In sync</Badge>
                </span>
              </div>
            ))}
            <Separator />
            <p className="landing-body">
              The ledger is the same record{" "}
              <span className="landing-mono">features.json</span> tracks, so the
              page cannot claim a feature the repository does not have.{" "}
              <span className="landing-mono">pnpm verify-features</span> reads
              it back and exits non-zero the moment a file drifts from its
              manifest.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
