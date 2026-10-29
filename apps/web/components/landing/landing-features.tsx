import { getIcon } from "./icons"
import { FEATURES } from "./content"

export function LandingFeatures() {
  return (
    <section className="section" id="features">
      <div className="stack-lg container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Why teams start here</span>
          <h2 className="landing-title landing-title-section">
            The parts every project rebuilds, already built
          </h2>
          <p className="landing-lede">
            Not a folder of snippets. A working split between frontend and
            backend, a shared type contract across it, and a feature system that
            keeps the two honest as the project grows.
          </p>
        </div>

        <div className="grid-auto">
          {FEATURES.map((feature) => {
            const Icon = getIcon(feature.icon)
            return (
              <article key={feature.title} className="landing-card">
                <span className="landing-card-icon">
                  <Icon />
                </span>
                <h3 className="landing-card-title">{feature.title}</h3>
                <p className="landing-body">{feature.body}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
