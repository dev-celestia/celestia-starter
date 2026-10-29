import { CheckCircleIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge, Kbd, Progress, Separator } from "@celestia-project/ui"

/**
 * The trace is the page's proof: one call site, every layer it crosses. Written
 * as a constant rather than inline JSX because it contains braces and backticks
 * that JSX would otherwise try to parse.
 */
const TRACE = `// apps/web — a client component
const post = await client.api.posts.$post({ json: { title, body } })
//    ^? { id: string; title: string; published: boolean }

// browser → /api/posts → apps/api (Hono) → packages/db → PostgreSQL
// 201 Created · 41ms · 4 layers crossed · 0 types written by hand`

const KEY_POINTS = [
  "No database handle ever reached the client bundle",
  "The response type was inferred from the route, not declared",
  "The session was verified before the insert, inside apps/api",
]

export function LandingTrace() {
  return (
    <section className="section" id="architecture">
      <div className="stack-lg container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">One request, end to end</span>
          <h2 className="landing-title landing-title-section">
            Follow a write from the browser to Postgres
          </h2>
          <p className="landing-lede">
            The web app calls the API the way it calls a local function. The
            signature comes from the server&apos;s own route tree, the session
            is checked on the way in, and the database is only ever touched on
            the far side of the boundary.
          </p>
        </div>

        <div className="landing-panel">
          <div className="landing-panel-bar">
            <div className="row-sm">
              <span className="landing-dots">
                <span className="landing-dot landing-dot-brand" />
                <span className="landing-dot" />
                <span className="landing-dot" />
              </span>
              <span className="landing-mono">POST /api/posts</span>
            </div>
            <div className="row-xs">
              <Badge variant="success">
                <CheckCircleIcon />
                Session verified
              </Badge>
              <Kbd>⌘K</Kbd>
            </div>
          </div>

          <div className="landing-trace-grid">
            <div className="landing-trace-col">
              <div className="row-sm">
                <Badge variant="outline">
                  <SparkleIcon />
                  createPost · Hono RPC
                </Badge>
                <span className="landing-mono">41ms</span>
              </div>

              <p className="landing-code-text">{TRACE}</p>

              <Separator />

              <span className="landing-eyebrow">Boundary crossings</span>
              <div className="landing-trace-list">
                <div className="landing-trace">
                  <span className="landing-trace-index">1</span>
                  <div className="landing-trace-text stack-xs">
                    <span className="landing-card-title">
                      apps/web/components/post-form.tsx
                    </span>
                    <span className="landing-card-meta">
                      <span>Client component</span>
                      <span className="landing-mono">no db import</span>
                    </span>
                  </div>
                  <Badge variant="outline">web</Badge>
                </div>

                <div className="landing-trace">
                  <span className="landing-trace-index">2</span>
                  <div className="landing-trace-text stack-xs">
                    <span className="landing-card-title">
                      apps/api/src/routes/posts.ts
                    </span>
                    <span className="landing-card-meta">
                      <span>Route handler</span>
                      <span className="landing-mono">owns the pool</span>
                    </span>
                  </div>
                  <Badge variant="success">api</Badge>
                </div>
              </div>
            </div>

            <div className="landing-trace-col">
              <span className="landing-eyebrow">Contract health</span>

              <div className="stack-sm">
                <div className="cluster-between">
                  <span className="landing-body">
                    Routes behind the typed client
                  </span>
                  <span className="landing-mono">12 / 12</span>
                </div>
                <Progress value={100} />
              </div>

              <div className="stack-sm">
                <div className="cluster-between">
                  <span className="landing-body">
                    Feature manifests verified
                  </span>
                  <span className="landing-mono">7 / 7</span>
                </div>
                <Progress value={100} />
              </div>

              <Separator />

              <span className="landing-eyebrow">
                What the boundary check enforced
              </span>
              <div className="stack-sm">
                {KEY_POINTS.map((point) => (
                  <span key={point} className="landing-keypoint">
                    <CheckCircleIcon className="landing-keypoint-mark" />
                    {point}
                  </span>
                ))}
              </div>

              <Separator />

              <span className="landing-eyebrow">Refused</span>
              <p className="landing-body">
                Two things are refused by construction: a database import inside
                apps/web, and a secret read outside apps/api. Both fail the
                build rather than being caught in review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
