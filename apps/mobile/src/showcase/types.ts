import type * as React from "react"

/**
 * Shared types for the mobile showcase.
 *
 * The showcase is deliberately the *host app* that `@celestia-project/mobile`
 * refuses to be. Every route, every piece of state and every navigation call
 * lives here; the components only render props and emit callbacks. That split is
 * the whole point of the library, so the demo would be misleading if it smuggled
 * a router or a data layer into a component.
 */

export type ShowcaseScheme = "light" | "dark"

export interface ShowcaseContext {
  /**
   * Push a full-screen screen preview by key.
   *
   * Keys are declared in `screens-preview.tsx`. An unknown key is ignored rather
   * than throwing — a dead button is a better failure mode than a blank screen.
   */
  openPreview: (key: string) => void
  /** The active colour scheme, for sections that mirror it in their copy. */
  scheme: ShowcaseScheme
}

export interface ShowcaseSectionDefinition {
  /** Stable key — used for the React key and as the section anchor. */
  key: string
  /** Section heading. */
  title: string
  /** One line under the heading explaining what the section covers. */
  summary: string
  /** The section body. */
  Component: React.ComponentType<{ ctx: ShowcaseContext }>
}
