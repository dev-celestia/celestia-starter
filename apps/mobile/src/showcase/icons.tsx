import * as React from "react"
import { useMobileTheme } from "@celestia-project/mobile"

/**
 * The showcase's icon seam.
 *
 * `@celestia-project/mobile` ships **no** icon dependency — every icon arrives
 * as a prop (design rule 6). This app is the consumer side of that contract, so
 * it is free to pick its own set. It picks Heroicons, drawn with
 * `react-native-svg`.
 *
 * Three things this file is deliberately responsible for:
 *
 * 1. **It is the only place that names a Heroicons component.** Every section
 *    asks for a semantic name (`"trash"`, `"search"`), so swapping the set — or
 *    the style — is an edit here and nowhere else. That is the same property the
 *    package promises its consumers, applied one level up.
 * 2. **No colour is ever hardcoded.** Heroicons draws with `currentColor`, so the
 *    `color` prop is what tints it, and it is resolved from `useMobileTheme()`
 *    at render time. Call sites only pass `color` when they need to match a
 *    surrounding control (a tab's active tint, a destructive button's surface).
 * 3. **Icons are decorative by default.** A glyph is not text; left exposed, a
 *    screen reader announces a meaningless mark. Every icon here is either
 *    decorative or sits inside a control that already owns an
 *    `accessibilityLabel`, so the whole set is hidden from assistive tech.
 *
 * The icons are imported **one module at a time**, on purpose. The package's
 * barrel (`react-native-heroicons/outline`) re-exports all 324 icons from a
 * single bundled module, and the package declares no `exports` map, so Metro
 * resolves the barrel as one unit — importing from it would ship every icon in
 * the set. Each icon is also published as its own minified module, which is what
 * these paths hit.
 */

import ArchiveBoxIcon from "react-native-heroicons/outline/ArchiveBoxIcon"
import AtSymbolIcon from "react-native-heroicons/outline/AtSymbolIcon"
import Bars3Icon from "react-native-heroicons/outline/Bars3Icon"
import BuildingOfficeIcon from "react-native-heroicons/outline/BuildingOfficeIcon"
import CheckCircleIcon from "react-native-heroicons/outline/CheckCircleIcon"
import ClockIcon from "react-native-heroicons/outline/ClockIcon"
import Cog6ToothIcon from "react-native-heroicons/outline/Cog6ToothIcon"
import DocumentTextIcon from "react-native-heroicons/outline/DocumentTextIcon"
import EnvelopeIcon from "react-native-heroicons/outline/EnvelopeIcon"
import ExclamationTriangleIcon from "react-native-heroicons/outline/ExclamationTriangleIcon"
import HomeIcon from "react-native-heroicons/outline/HomeIcon"
import InformationCircleIcon from "react-native-heroicons/outline/InformationCircleIcon"
import MagnifyingGlassIcon from "react-native-heroicons/outline/MagnifyingGlassIcon"
import PencilSquareIcon from "react-native-heroicons/outline/PencilSquareIcon"
import PlusIcon from "react-native-heroicons/outline/PlusIcon"
import QuestionMarkCircleIcon from "react-native-heroicons/outline/QuestionMarkCircleIcon"
import RectangleGroupIcon from "react-native-heroicons/outline/RectangleGroupIcon"
import ShareIcon from "react-native-heroicons/outline/ShareIcon"
import SparklesIcon from "react-native-heroicons/outline/SparklesIcon"
import StarIcon from "react-native-heroicons/outline/StarIcon"
import TrashIcon from "react-native-heroicons/outline/TrashIcon"
import UserIcon from "react-native-heroicons/outline/UserIcon"
import XCircleIcon from "react-native-heroicons/outline/XCircleIcon"

/**
 * Every icon the showcase needs, by semantic name.
 *
 * The keys describe *intent*, not the glyph — `"mail"` rather than
 * `"envelope"` — so a section never has to know which library is underneath.
 *
 * Note what is missing: there are no brand logos. Heroicons ships none (Tailwind
 * deliberately excludes them), so Apple / Google / GitHub / WeChat have no mark
 * to draw and those rows render label-only.
 */
export const SHOWCASE_ICONS = {
  // Navigation chrome
  home: HomeIcon,
  search: MagnifyingGlassIcon,
  mail: EnvelopeIcon,
  settings: Cog6ToothIcon,
  archive: ArchiveBoxIcon,
  menu: Bars3Icon,
  // Actions
  add: PlusIcon,
  star: StarIcon,
  share: ShareIcon,
  trash: TrashIcon,
  // Field slots
  at: AtSymbolIcon,
  check: CheckCircleIcon,
  // Content
  capture: PencilSquareIcon,
  organise: RectangleGroupIcon,
  note: DocumentTextIcon,
  person: UserIcon,
  // Identity
  logo: SparklesIcon,
  sso: BuildingOfficeIcon,
  // Status outcomes — mirror the package's own variant vocabulary
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  help: QuestionMarkCircleIcon,
  time: ClockIcon,
} as const

export type ShowcaseIconName = keyof typeof SHOWCASE_ICONS

/**
 * Four optical steps.
 *
 * Named rather than numeric so the gallery keeps one consistent scale instead of
 * scattering magic numbers through six section files — the same reason the
 * package itself names its sizes rather than taking pixels.
 */
export const SHOWCASE_ICON_SIZE = {
  /** Inline with caption text — input and settings-row slots. */
  sm: 16,
  /** Inside a 44pt control — nav buttons, icon buttons, tab bar. */
  md: 22,
  /** The onboarding pager's media slot. */
  lg: 28,
  /** Display-size slots — the status indicator, empty state and auth logo. */
  xl: 32,
} as const

export type ShowcaseIconSize = keyof typeof SHOWCASE_ICON_SIZE

export interface ShowcaseIconProps {
  /** Semantic name from `SHOWCASE_ICONS`. */
  name: ShowcaseIconName
  /** Optical step. @default 'md' */
  size?: ShowcaseIconSize
  /**
   * Overrides the themed default. Only pass this to match a surrounding
   * control — a tab's active tint, a destructive button's surface — never a
   * literal colour.
   */
  color?: string
}

/**
 * Renders one Heroicons glyph, themed and hidden from assistive tech.
 *
 * The default colour is `foreground`, which is what a plain inline icon should
 * be. Every slot in the package renders its icon children untouched — none of
 * them tints what you hand it — so the colour always has to come from here.
 */
export function ShowcaseIcon({ name, size = "md", color }: ShowcaseIconProps) {
  const { colors } = useMobileTheme()
  const Icon = SHOWCASE_ICONS[name]

  return (
    <Icon
      size={SHOWCASE_ICON_SIZE[size]}
      color={color ?? colors.foreground}
      accessible={false}
      importantForAccessibility="no"
    />
  )
}
