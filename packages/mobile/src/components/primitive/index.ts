/**
 * Celestia Mobile — Primitive components
 *
 * Generic, single-purpose building blocks. Each one wraps exactly one native
 * control (or one plain surface) and composes no other Celestia component.
 *
 * This mirrors `@celestia-project/ui/primitive`, where "primitive" means
 * *generic* rather than *atomic* — so a compound component such as
 * `MobileCard` (which ships Header/Title/Description/Content/Footer) still
 * belongs here. Anything assembled from these pieces to solve a specific
 * UX pattern lives in `../composite`.
 */

export * from "./badge"
export * from "./bottom-sheet"
export * from "./button"
export * from "./card"
export * from "./input"
export * from "./list"
export * from "./switch"
export * from "./text"
