import { METRICS } from "./content"

export function LandingMetrics() {
  return (
    <section className="section-tight" id="metrics">
      <div className="stack-lg container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Counted, not claimed</span>
          <h2 className="landing-title landing-title-section">
            What you get on the first commit
          </h2>
          <p className="landing-lede">
            Every figure below is read out of this repository rather than
            written for the page.
          </p>
        </div>

        <div className="landing-metrics">
          {METRICS.map((metric) => (
            <div key={metric.label} className="landing-metric">
              <span className="landing-metric-value">{metric.value}</span>
              <span className="landing-metric-label">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
