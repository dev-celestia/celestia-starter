import type { ShowcaseSectionDefinition } from "../types"
import { ActionsSection } from "./actions"
import { AiSection } from "./ai"
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
 * The eight sections cover all 157 modules of `@celestia-project/mobile`:
 * foundations (surfaces, layout, media, tokens, loading, charts), actions
 * (buttons, toggles, pickers, haptic commits), forms (inputs, OTP, PIN),
 * data display (lists, cards, rows, tables, messaging), navigation (bars,
 * tabs, steppers, pagination), overlays (sheets, modals, alerts, toasts),
 * AI (transcript, composer, model and context controls, agents) and screens
 * (the twenty full-page layouts).
 *
 * AI sits last but one on purpose: it is an assembly category like the screens,
 * and every one of its modules composes primitives and composites the earlier
 * sections have already introduced.
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
    key: "ai",
    title: "AI",
    summary:
      "The assistant surfaces: transcript, streaming states, reasoning and tool calls, citations, the composer, and the model, context and agent controls.",
    Component: AiSection,
  },
  {
    key: "screens",
    title: "Screens",
    summary:
      "The twenty full-screen layout modules. Each opens full-screen so it can own its own safe area and header.",
    Component: ScreensSection,
  },
]
