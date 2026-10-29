/**
 * Hero illustration — an abstract "engineered system suspended in a light
 * field", drawn as inline SVG rather than a raster asset.
 *
 * Why SVG instead of an image file:
 *
 *   1. **It follows the theme.** Every colour is a design token
 *      (`var(--primary)`, `var(--foreground)`), so the piece recolours itself
 *      for light mode, dark mode, and all eight accent palettes
 *      (`lib/theme/palettes.ts`) without shipping a second asset. A raster
 *      would have to pick one hue and would clash with seven of the eight
 *      accents.
 *   2. **It is a few KB of markup** instead of a 1.7 MB PNG, needs no
 *      image-optimizer round trip, and stays crisp at any density.
 *   3. **Nothing is hardcoded.** The token layer in
 *      `@celestia-project/ui/globals.css` is the single source of truth for
 *      colour, so this file introduces no new literals.
 *
 * Presentational rules live in `landing.css` (section 18). The only CSS the
 * component depends on is the `.hero-ill-orbit` travel animation, which is
 * wrapped in a `prefers-reduced-motion` guard.
 *
 * The composition is three readings stacked: an isometric ground lattice
 * (structure), a stack of translucent plates (layers / architecture), and an
 * elliptical orbit ring with node traces (a live system). Everything sits on a
 * transparent ground and is feathered top and bottom, so the band melts into
 * whatever background the active theme provides.
 */

/** Isometric projection for the ground lattice. 2:1 ratio, classic iso. */
const ISO = { sx: 34, sy: 17, cx: 600, cy: 252, range: 6 }

/** The orbit ring. Tilt is applied about the ring's own centre. */
const ORBIT = { cx: 600, cy: 296, rx: 558, ry: 118, tilt: -5 }

/**
 * Ellipse circumference, Ramanujan's second approximation. The travelling
 * highlight is a dash whose `dasharray` sums to exactly this, so the loop is
 * seamless with no visible jump at the wrap point.
 */
const ORBIT_LENGTH = 2356

const VIEW = { w: 1200, h: 514 }

/** Grid vertex -> screen space. */
function project(u: number, v: number): [number, number] {
  return [ISO.cx + (u - v) * ISO.sx, ISO.cy + (u + v) * ISO.sy]
}

/** Both lattice directions in one path, so the grid is a single DOM node. */
const GRID_PATH = (() => {
  const segments: string[] = []
  for (let k = -ISO.range; k <= ISO.range; k += 1) {
    const [ax, ay] = project(k, -ISO.range)
    const [bx, by] = project(k, ISO.range)
    segments.push(`M${ax} ${ay}L${bx} ${by}`)

    const [cx, cy] = project(-ISO.range, k)
    const [dx, dy] = project(ISO.range, k)
    segments.push(`M${cx} ${cy}L${dx} ${dy}`)
  }
  return segments.join(" ")
})()

/**
 * Nodes sit on the ring, so they inherit its tilt. Rotating each point by the
 * same angle about the same centre keeps them pinned to the ellipse.
 */
const NODES = [-158, -104, -50, 12, 68, 126].map((deg) => {
  const t = (deg * Math.PI) / 180
  const px = ORBIT.rx * Math.cos(t)
  const py = ORBIT.ry * Math.sin(t)
  const r = (ORBIT.tilt * Math.PI) / 180
  return {
    x: ORBIT.cx + px * Math.cos(r) - py * Math.sin(r),
    y: ORBIT.cy + px * Math.sin(r) + py * Math.cos(r),
  }
})

/** Stacked rhombi. Higher plates are smaller and fainter — receding depth. */
const PLATES = [0, 1, 2, 3].map((i) => ({
  cy: 336 - i * 36,
  hw: 296 - i * 30,
  hh: 72 - i * 7,
  fill: 0.1 - i * 0.018,
}))

/** Static stroke roles. var()-driven colours must go in `style`, not attributes. */
const hairline = {
  fill: "none",
  stroke: "var(--foreground)",
  strokeOpacity: 0.13,
  strokeWidth: 1,
} as const

const accentLine = {
  fill: "none",
  stroke: "var(--primary)",
} as const

export function HeroIllustration() {
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className="hero-ill"
      // Decorative: it carries no information a screen reader needs, and the
      // hero's meaning is already fully expressed by the copy above it.
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient
          id="heroIllBloom"
          gradientUnits="userSpaceOnUse"
          cx={880}
          cy={140}
          r={540}
        >
          <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.34 }} />
          <stop offset="45%" style={{ stopColor: "var(--primary)", stopOpacity: 0.11 }} />
          <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
        </radialGradient>

        {/* Feathers the top and bottom edges so the band has no hard seam. */}
        <linearGradient id="heroIllFeather" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "#fff", stopOpacity: 0 }} />
          <stop offset="20%" style={{ stopColor: "#fff", stopOpacity: 1 }} />
          <stop offset="80%" style={{ stopColor: "#fff", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#fff", stopOpacity: 0 }} />
        </linearGradient>
        <mask id="heroIllMask">
          <rect width={VIEW.w} height={VIEW.h} fill="url(#heroIllFeather)" />
        </mask>
      </defs>

      <g mask="url(#heroIllMask)">
        {/* 1. Light field. */}
        <rect width={VIEW.w} height={VIEW.h} fill="url(#heroIllBloom)" />

        {/* 2. Ground lattice — one path, hairlines held at 1px at any scale. */}
        <path
          d={GRID_PATH}
          style={hairline}
          vectorEffect="non-scaling-stroke"
        />

        {/* 3. Translucent plate stack. */}
        {PLATES.map((plate) => (
          <path
            key={plate.cy}
            d={`M${ISO.cx} ${plate.cy - plate.hh}L${ISO.cx + plate.hw} ${plate.cy}L${ISO.cx} ${plate.cy + plate.hh}L${ISO.cx - plate.hw} ${plate.cy}Z`}
            vectorEffect="non-scaling-stroke"
            style={{
              fill: "var(--primary)",
              fillOpacity: plate.fill,
              stroke: "var(--primary)",
              strokeOpacity: 0.3,
              strokeWidth: 1,
            }}
          />
        ))}

        {/* 4. Orbit ring + travelling highlight. */}
        <g transform={`rotate(${ORBIT.tilt} ${ORBIT.cx} ${ORBIT.cy})`}>
          <ellipse
            cx={ORBIT.cx}
            cy={ORBIT.cy}
            rx={ORBIT.rx}
            ry={ORBIT.ry}
            vectorEffect="non-scaling-stroke"
            style={{ ...accentLine, strokeOpacity: 0.22, strokeWidth: 1 }}
          />
          <ellipse
            className="hero-ill-orbit"
            cx={ORBIT.cx}
            cy={ORBIT.cy}
            rx={ORBIT.rx}
            ry={ORBIT.ry}
            strokeDasharray={`360 ${ORBIT_LENGTH - 360}`}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ ...accentLine, strokeOpacity: 0.85, strokeWidth: 2 }}
          />
        </g>

        {/* 5. Nodes and their traces. */}
        {NODES.map((node) => (
          <g key={`${node.x}-${node.y}`}>
            <line
              x1={node.x}
              y1={node.y}
              x2={node.x}
              y2={node.y + 46}
              vectorEffect="non-scaling-stroke"
              style={{ stroke: "var(--foreground)", strokeOpacity: 0.2, strokeWidth: 1 }}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={8}
              style={{ fill: "var(--primary)", fillOpacity: 0.18 }}
            />
            <circle cx={node.x} cy={node.y} r={3.2} style={{ fill: "var(--primary)" }} />
          </g>
        ))}
      </g>
    </svg>
  )
}
