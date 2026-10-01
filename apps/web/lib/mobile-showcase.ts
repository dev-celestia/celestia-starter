/**
 * `/mobile` surface data — the single source of truth for the dedicated
 * mobile showcase page.
 *
 * Everything here is transcribed from the package itself, not invented:
 *
 * - the category counts mirror `packages/mobile/src/components/` and
 *   `content/docs/mobile.mdx`;
 * - the design rules and the platform matrix mirror `content/docs/mobile.mdx`.
 *
 * Keeping it in one file means the page copy and the structure cannot drift
 * apart. The per-module index lives in the docs (`/docs/mobile`), which is the
 * technical reference; this surface stays visual.
 */

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                    */
/* -------------------------------------------------------------------------- */

/** The package's role-based split. Drives the mental model, not the layout. */
export type MobileCategoryId = "primitive" | "composite" | "ai" | "layout"

export interface MobileCategory {
  id: MobileCategoryId
  name: string
  directory: string
  /** What belongs in this bucket. */
  belongs: string
  /** The question to ask when filing a new component. */
  rule: string
  count: number
}

export const MOBILE_CATEGORIES: MobileCategory[] = [
  {
    id: "primitive",
    name: "Primitive",
    directory: "src/components/primitive/",
    belongs:
      "Generic building blocks. Each wraps one native control or one plain surface.",
    rule: "Would I reach for this in any app?",
    count: 52,
  },
  {
    id: "composite",
    name: "Composite",
    directory: "src/components/composite/",
    belongs: "Opinionated assemblies built from primitives.",
    rule: "Is this a <Primitive> with a specific job?",
    count: 58,
  },
  {
    id: "ai",
    name: "AI",
    directory: "src/components/ai/",
    belongs:
      "Assistant, agent and generative surfaces — transcript, composer, model and context controls, grounding and feedback.",
    rule: "Does it only make sense next to a model?",
    count: 27,
  },
  {
    id: "layout",
    name: "Layout",
    directory: "src/components/layout/",
    belongs:
      "Full-screen shells and screens. Own the frame; take content through slots.",
    rule: "Does it own the whole screen?",
    count: 20,
  },
]

export const MOBILE_MODULE_TOTAL = MOBILE_CATEGORIES.reduce(
  (total, category) => total + category.count,
  0
)

/* -------------------------------------------------------------------------- */
/* Design rules                                                                */
/* -------------------------------------------------------------------------- */

export interface MobileRule {
  title: string
  detail: string
}

/**
 * The package's non-negotiables. Enforced by convention and review, not by a
 * linter — which is exactly why they are worth stating on the surface.
 */
export const MOBILE_RULES: MobileRule[] = [
  {
    title: "No hardcoded colours",
    detail:
      "Everything reads useMobileTheme(); the light and dark ramps are both complete.",
  },
  {
    title: "44×44pt minimum touch target",
    detail:
      "On every interactive element, exposed as metrics.minTouchTarget. A control drawn shorter to match the web design system — MobileButton is 32px — meets the floor with hitSlop rather than by inflating the box.",
  },
  {
    title: "Haptics fire on the causal commit frame",
    detail:
      "Light for a normal press, Medium for a destructive one, selectionAsync for a toggle. Never on mount.",
  },
  {
    title: "16px font floor on text inputs",
    detail: "Below it, iOS zooms the viewport on focus and never zooms back.",
  },
  {
    title: "Tabular numerals for counters",
    detail:
      "Prices, timers and counts, so a changing digit does not shift the row.",
  },
  {
    title: "Icons arrive as props",
    detail:
      "The package takes no icon dependency; only structural marks (a tick, a chevron, a magnifier) are drawn inline.",
  },
  {
    title: "No hover-only affordances",
    detail:
      "There is no hover on a thumb. Anything hidden behind one does not exist.",
  },
  {
    title: "Forms never disable submit for empty fields",
    detail:
      "It stays pressable and names what is missing; it is disabled only while loading.",
  },
  {
    title: "Screens are presentational",
    detail:
      "Props in, callbacks out — no fetching, no auth client, no routing.",
  },
]

/* -------------------------------------------------------------------------- */
/* Platform support                                                            */
/* -------------------------------------------------------------------------- */

export interface MobilePlatformRow {
  capability: string
  ios: "yes" | "no"
  android: "yes" | "no"
  note: string
}

export const MOBILE_PLATFORM: MobilePlatformRow[] = [
  {
    capability: "Components built on @expo/ui",
    ios: "yes",
    android: "yes",
    note: "SwiftUI on iOS, Jetpack Compose on Android, through the universal entry",
  },
  {
    capability: "Rest of the package (plain React Native)",
    ios: "yes",
    android: "yes",
    note: "No @expo/ui at runtime",
  },
  {
    capability: "apps/mobile showcase",
    ios: "yes",
    android: "yes",
    note: "Runs in Expo Go — no development build needed",
  },
]

export interface MobileEntryPoint {
  specifier: string
  implementation: string
  platforms: string
}

/**
 * `@expo/ui@57` exposes three entry points. Every module here imports the bare
 * specifier — the universal one — so the same code resolves to the right
 * native implementation on each platform.
 */
export const MOBILE_ENTRY_POINTS: MobileEntryPoint[] = [
  {
    specifier: "@expo/ui",
    implementation:
      "Universal — resolves to the .ios.tsx / .android.tsx implementation for the current platform",
    platforms: "iOS · Android",
  },
  {
    specifier: "@expo/ui/swift-ui",
    implementation: "SwiftUI only",
    platforms: "iOS",
  },
  {
    specifier: "@expo/ui/jetpack-compose",
    implementation: "Jetpack Compose only",
    platforms: "Android",
  },
]

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                     */
/* -------------------------------------------------------------------------- */

export interface MobileSection {
  id: string
  title: string
  /** Group this section belongs to in the rail. */
  group: string
}

export const MOBILE_SECTIONS: MobileSection[] = [
  { id: "overview", title: "Overview", group: "Get started" },
  { id: "showcase", title: "Run in Expo Go", group: "Get started" },
  { id: "rules", title: "Design rules", group: "Get started" },
  { id: "platform", title: "Platform support", group: "Get started" },
]
