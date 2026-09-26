import type { ShowcaseSectionDefinition } from "../types"
import { ActionsSection } from "./actions"
import { DataSection } from "./data"
import { FormsSection } from "./forms"
import { FoundationsSection } from "./foundations"
import { NavigationSection } from "./navigation"
import { OverlaysSection } from "./overlays"
import { ScreensSection } from "./screens"

/**
 * The gallery's table of contents.
 *
 * This array is the single source of truth for what the showcase covers and in
 * what order. Section titles and summaries live here rather than inside each
 * section file, so the copy and the structure cannot drift apart — and adding a
 * section is a one-line change in one place.
 *
 * The seven sections cover all 43 modules of `@celestia-project/mobile`:
 *
 * | Section     | Category   | Modules |
 * |-------------|------------|---------|
 * | Foundations | primitive  | 9       |
 * | Actions     | primitive  | 6       |
 * | Forms       | both       | 4       |
 * | Data        | both       | 5       |
 * | Navigation  | both       | 4       |
 * | Overlays    | both       | 5       |
 * | Screens     | layout     | 10      |
 */
export const SHOWCASE_SECTIONS: ShowcaseSectionDefinition[] = [
  {
    key: "foundations",
    title: "Foundations",
    summary:
      "Type scale, semantic colour, status badges, avatars and the loading surfaces — the modules with no interaction of their own.",
    Component: FoundationsSection,
  },
  {
    key: "actions",
    title: "Actions",
    summary:
      "Buttons, toggles and pickers. Every one commits a change, so every one fires haptics on the causal frame.",
    Component: ActionsSection,
  },
  {
    key: "forms",
    title: "Forms",
    summary:
      "Text fields, one-time codes, labelled field wrappers and social sign-in — with a 16px input floor and no disabled submit buttons.",
    Component: FormsSection,
  },
  {
    key: "data",
    title: "Data display",
    summary:
      "The native grouped list, card surfaces, avatar stacks, settings rows and the empty state.",
    Component: DataSection,
  },
  {
    key: "navigation",
    title: "Navigation",
    summary:
      "Nav bars, tab bars, segmented controls and search. All controlled props — none of them routing.",
    Component: NavigationSection,
  },
  {
    key: "overlays",
    title: "Overlays",
    summary:
      "Inline alerts, transient toasts, and the three modal presentations, with the interruption level of each made explicit.",
    Component: OverlaysSection,
  },
  {
    key: "screens",
    title: "Screens",
    summary:
      "The ten full-screen layout modules. Each opens full-screen so it can own its own safe area and header.",
    Component: ScreensSection,
  },
]
