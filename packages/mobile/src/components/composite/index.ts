/**
 * Celestia Mobile — Composite components
 *
 * Opinionated assemblies built from `../primitive`. Each one solves a specific
 * UX pattern — a labelled form field, a nav bar, a bottom tab bar, a search
 * bar — rather than exposing a raw control.
 *
 * Rule of thumb: if it can be described as "a `<Primitive>` with a specific job",
 * it is a composite. If it is a generic piece you would reach for in any app,
 * it belongs in `../primitive` instead.
 *
 * Composites are presentational, like everything else in this package: they take
 * props and emit callbacks. None of them fetches, routes, or holds server state.
 */

export * from "./action-sheet"
export * from "./alert"
export * from "./avatar-group"
export * from "./confirm-dialog"
export * from "./empty-state"
export * from "./form-field"
export * from "./navbar"
export * from "./search-bar"
export * from "./segmented-control"
export * from "./setting-row"
export * from "./social-auth-buttons"
export * from "./tab-bar"
export * from "./toast"
