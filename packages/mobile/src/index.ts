/**
 * Celestia Mobile UI Components (@celestia-project/mobile)
 *
 * Powered by @expo/ui (real SwiftUI on iOS, Jetpack Compose on Android)
 * with strict adherence to:
 * - expo-ui & expo-animation (Native controls, Host bridge, spring physics, haptics)
 * - better-colors (WCAG AA contrast, semantic roles)
 * - better-interface (44x44pt touch targets, no hover dependency)
 * - better-typography (proportional line-heights, 16px mobile input floor, tabular-nums)
 *
 * Components are grouped by role:
 * - `primitive/` — generic single-control building blocks
 * - `composite/` — opinionated assemblies built from primitives
 * - `layout/`    — full-screen shells and screens (presentational only)
 *
 * Deep imports mirror the grouping:
 *   import { MobileButton } from "@celestia-project/mobile/primitive/button"
 *   import { MobileCard } from "@celestia-project/mobile/primitive"
 */

// ---------------------------------------------------------------------------
// Cross-cutting infrastructure (theme context + design tokens)
// ---------------------------------------------------------------------------

export * from "./tokens"
export * from "./host"

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export * from "./components/primitive"
export * from "./components/composite"
export * from "./components/layout"
