/**
 * Landing navigation data — the single source for the left-rail nav
 * (`landing-nav.tsx`) and the footer's Explore group.
 *
 * Two kinds of destination, kept apart because they behave differently:
 * anchors scroll within this page; surfaces leave it (app routes or
 * external sites). The marketing navbar's Products dropdown has its own
 * richer copy of the surfaces list in `navbar.tsx`.
 */

/** In-page sections, in the order they appear on the page. */
export const LANDING_ANCHORS = [
  { label: "Services", href: "#services" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Process", href: "#process" },
  { label: "Tech Stack", href: "#tech-stack" },
] as const

/** The starter's own surfaces. Rail shows these on lg+; the footer carries
    them at every size, so small screens still have a visible path to them. */
export const LANDING_SURFACES = [
  { label: "Design System", href: "/design-system", external: false },
  { label: "Documentation", href: "/docs", external: false },
  { label: "Feature Installer", href: "/feature-installer", external: false },
  { label: "Hexbuffer", href: "https://0xbuffer.com/", external: true },
] as const

export const LANDING_CTA = { label: "Book a Consultation", href: "#contact" } as const

export const GITHUB_URL = "https://github.com/dev-celestia/celestia-starter"
