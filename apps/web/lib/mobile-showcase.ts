/**
 * `/mobile` surface data — the single source of truth for the dedicated
 * mobile showcase page.
 *
 * Everything here is transcribed from the package itself, not invented:
 *
 * - the module inventory and its functional grouping mirror
 *   `apps/mobile/src/showcase/sections/index.ts`, which is the showcase app's
 *   own table of contents and covers all 43 modules;
 * - the token values mirror `packages/mobile/src/tokens.ts`;
 * - the design rules and the platform matrix mirror `content/docs/mobile.mdx`.
 *
 * Keeping it in one file means the page copy and the structure cannot drift
 * apart, and adding a module is a one-line change in one place.
 */

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                    */
/* -------------------------------------------------------------------------- */

/** The package's role-based split. Drives the mental model, not the layout. */
export type MobileCategoryId = "primitive" | "composite" | "layout"

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
    belongs: "Generic building blocks. Each wraps one native control or one plain surface.",
    rule: "Would I reach for this in any app?",
    count: 20,
  },
  {
    id: "composite",
    name: "Composite",
    directory: "src/components/composite/",
    belongs: "Opinionated assemblies built from primitives.",
    rule: "Is this a <Primitive> with a specific job?",
    count: 13,
  },
  {
    id: "layout",
    name: "Layout",
    directory: "src/components/layout/",
    belongs:
      "Full-screen shells and screens. Own the frame; take content through slots.",
    rule: "Does it own the whole screen?",
    count: 10,
  },
]

export const MOBILE_MODULE_TOTAL = MOBILE_CATEGORIES.reduce(
  (total, category) => total + category.count,
  0
)

/* -------------------------------------------------------------------------- */
/* Functional groups — the practical index                                     */
/* -------------------------------------------------------------------------- */

export interface MobileModule {
  /** Exported component name, or the primary one for a multi-export module. */
  name: string
  category: MobileCategoryId
  /** Path under `src/components/`, or a bare path for infra modules. */
  modulePath: string
  /** One line on what it is for. */
  summary: string
}

export interface MobileGroup {
  id: string
  name: string
  summary: string
  modules: MobileModule[]
}

/**
 * The seven groups the showcase app uses. Unlike the folder split, these are
 * organised by *what the module is for*, which is how a consumer actually
 * looks for one. Together they cover all 43 modules exactly once.
 */
export const MOBILE_GROUPS: MobileGroup[] = [
  {
    id: "foundations",
    name: "Foundations",
    summary:
      "The modules with no interaction of their own — type, semantic colour, badges, avatars and the loading surfaces.",
    modules: [
      {
        name: "MobileText",
        category: "primitive",
        modulePath: "primitive/text",
        summary:
          "The type primitive. Proportional line-heights, a 16px floor, and opt-in tabular numerals per node.",
      },
      {
        name: "MobileLabel",
        category: "primitive",
        modulePath: "primitive/label",
        summary:
          "Field labels. The required marker is appended as a structural mark, so a translation cannot drop it.",
      },
      {
        name: "MobileBadge",
        category: "primitive",
        modulePath: "primitive/badge",
        summary: "Seven variants plus a tabular flag for counts that change.",
      },
      {
        name: "MobileAvatar",
        category: "primitive",
        modulePath: "primitive/avatar",
        summary:
          "Initials trimmed to two characters and upper-cased; an image wins over initials, a custom fallback wins over both.",
      },
      {
        name: "MobileSeparator",
        category: "primitive",
        modulePath: "primitive/separator",
        summary: "Horizontal, labelled, or vertical inside a row.",
      },
      {
        name: "MobileSkeleton",
        category: "primitive",
        modulePath: "primitive/skeleton",
        summary: "Shimmer placeholder that mirrors the shape of the content it stands in for.",
      },
      {
        name: "MobileSpinner",
        category: "primitive",
        modulePath: "primitive/spinner",
        summary: "Native activity indicator, for waits too short to justify a skeleton.",
      },
      {
        name: "MobileProgress",
        category: "primitive",
        modulePath: "primitive/progress",
        summary: "Takes a 0–1 value and clamps it, so a caller cannot overflow the track.",
      },
      {
        name: "MobileLink",
        category: "primitive",
        modulePath: "primitive/link",
        summary:
          "Inline sits in a paragraph; standalone is a full-width tappable row. Both are real buttons to a screen reader.",
      },
    ],
  },
  {
    id: "actions",
    name: "Actions",
    summary:
      "Every module whose whole job is to accept a gesture — so every one fires haptics on the causal frame.",
    modules: [
      {
        name: "MobileButton",
        category: "primitive",
        modulePath: "primitive/button",
        summary:
          "Five variants across three sizes, drawn to the web Button's anatomy: a 32px surface, a 6px radius and a hard 2px bottom edge. The 44pt touch floor is met with hitSlop rather than by inflating the box; the haptic fires on commit, not on release.",
      },
      {
        name: "MobileIconButton",
        category: "primitive",
        modulePath: "primitive/icon-button",
        summary:
          "`accessibilityLabel` is a required prop, not an option — an icon-only control has no text to announce.",
      },
      {
        name: "MobileCheckbox",
        category: "primitive",
        modulePath: "primitive/checkbox",
        summary:
          "The error state recolours the box only; `checked` wins over `error`, because an error on a checked box is contradictory.",
      },
      {
        name: "MobileSwitch",
        category: "primitive",
        modulePath: "primitive/switch",
        summary:
          "The real @expo/ui control — SwiftUI Toggle on iOS, Compose Switch on Android. Toggling fires selectionAsync.",
      },
      {
        name: "MobileSlider",
        category: "primitive",
        modulePath: "primitive/slider",
        summary:
          "Built on PanResponder rather than a native module, so the package keeps its zero-new-dependency rule. `onSlidingComplete` is the commit.",
      },
      {
        name: "MobileRadioGroup",
        category: "primitive",
        modulePath: "primitive/radio-group",
        summary: "Descriptions are optional per option, and one disabled option does not disable the group.",
      },
    ],
  },
  {
    id: "forms",
    name: "Forms",
    summary:
      "Text entry with a 16px input floor, and no disabled submit buttons for empty fields.",
    modules: [
      {
        name: "MobileTextInput",
        category: "primitive",
        modulePath: "primitive/input",
        summary:
          "The 16px floor stops iOS zooming the viewport on focus. The reveal toggle and clear affordance share one trailing slot.",
      },
      {
        name: "MobileOtpInput",
        category: "primitive",
        modulePath: "primitive/otp-input",
        summary:
          "Digits are stripped to numbers and clamped to length. `onComplete` fires once when the code fills — the seam for auto-submit.",
      },
      {
        name: "MobileFormField",
        category: "composite",
        modulePath: "composite/form-field",
        summary:
          "Owns the label, required marker, description and error slot. A bare input has nowhere to put helper text, which is why this exists.",
      },
      {
        name: "MobileSocialAuthButtons",
        category: "composite",
        modulePath: "composite/social-auth-buttons",
        summary:
          "Providers arrive as data, so the package keeps its no-icon-dependency rule. `icon` is optional; one column by default, two for short labels.",
      },
    ],
  },
  {
    id: "data",
    name: "Data display",
    summary:
      "The native grouped list, card surfaces, avatar stacks, settings rows and the empty state.",
    modules: [
      {
        name: "MobileList",
        category: "primitive",
        modulePath: "primitive/list",
        summary:
          "A real SwiftUI List on iOS and a Compose list on Android, bridged through @expo/ui — not a styled ScrollView.",
      },
      {
        name: "MobileCard",
        category: "primitive",
        modulePath: "primitive/card",
        summary:
          "Header, title, description, content and footer as separate slots. A string child renders as type; anything else passes through untouched.",
      },
      {
        name: "MobileAvatarGroup",
        category: "composite",
        modulePath: "composite/avatar-group",
        summary:
          "Overflow collapses into a +N chip once the list exceeds `max`, so a long collaborator list cannot push a row off screen.",
      },
      {
        name: "MobileSettingRow",
        category: "composite",
        modulePath: "composite/setting-row",
        summary:
          "A row with `onPress` shows a chevron; a row with a value and no `onPress` is a read-out and does not.",
      },
      {
        name: "MobileEmptyState",
        category: "composite",
        modulePath: "composite/empty-state",
        summary:
          "`title` is required — an illustration with no explanation is not an empty state.",
      },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    summary:
      "Nav bars, tab bars, segmented controls and search. All controlled props — none of them routing.",
    modules: [
      {
        name: "MobileNavBar",
        category: "composite",
        modulePath: "composite/navbar",
        summary:
          "`onBack` is what makes the back chevron appear, so there is no separate flag to keep in sync. The trailing slot takes any node.",
      },
      {
        name: "MobileTabBar",
        category: "composite",
        modulePath: "composite/tab-bar",
        summary:
          "Badges accept a string or a number, so a count and a dot share one slot. A disabled tab is skipped by the press handler.",
      },
      {
        name: "MobileSegmentedControl",
        category: "composite",
        modulePath: "composite/segmented-control",
        summary:
          "A disabled segment stays visible, so the option set does not change shape between states.",
      },
      {
        name: "MobileSearchBar",
        category: "composite",
        modulePath: "composite/search-bar",
        summary:
          "`onSubmit` is the commit — where a query belongs. `onClear` fires after the value empties, so a caller can reset results without re-deriving.",
      },
    ],
  },
  {
    id: "overlays",
    name: "Overlays",
    summary:
      "Inline alerts, transient toasts, and the three modal presentations — with the interruption level of each made explicit.",
    modules: [
      {
        name: "MobileAlert",
        category: "composite",
        modulePath: "composite/alert",
        summary:
          "No focus stealing, so several can sit on one screen. Only the destructive variant announces itself as an alert.",
      },
      {
        name: "MobileToast",
        category: "composite",
        modulePath: "composite/toast",
        summary:
          "One toast owns the screen at a time — replacing rather than stacking. An action should use duration 0 so it cannot expire first.",
      },
      {
        name: "MobileBottomSheet",
        category: "primitive",
        modulePath: "primitive/bottom-sheet",
        summary:
          "The real native sheet, taking snap points. Blocks the screen, so it is for a decision the user must make.",
      },
      {
        name: "MobileActionSheet",
        category: "composite",
        modulePath: "composite/action-sheet",
        summary: "A list of choices with a cancel escape, for actions that need naming rather than confirming.",
      },
      {
        name: "MobileConfirmDialog",
        category: "composite",
        modulePath: "composite/confirm-dialog",
        summary:
          "One decision, and it can hold a spinner while it commits — so a slow delete does not look like a no-op.",
      },
    ],
  },
  {
    id: "screens",
    name: "Screens",
    summary:
      "The ten full-screen modules. Each owns its own safe area, header and footer, and takes content through slots.",
    modules: [
      {
        name: "MobileScreen",
        category: "layout",
        modulePath: "layout/screen",
        summary:
          "The base frame every other layout module composes. Safe-area padding lives on the frame, so the background fills the notch while the text stays inset.",
      },
      {
        name: "MobileAuthShell",
        category: "layout",
        modulePath: "layout/auth-shell",
        summary:
          "Adds the logo / heading / form / aside / footer arrangement the five auth screens share.",
      },
      {
        name: "MobileOnboardingScreen",
        category: "layout",
        modulePath: "layout/onboarding-screen",
        summary:
          "Swipeable pager with a dot indicator and skip / next / get-started actions.",
      },
      {
        name: "MobileSignInScreen",
        category: "layout",
        modulePath: "layout/sign-in-screen",
        summary: "Email, password, remember-me, OAuth rows and both cross-links.",
      },
      {
        name: "MobileSignUpScreen",
        category: "layout",
        modulePath: "layout/sign-up-screen",
        summary: "Name, email, password with hints, and a terms checkbox.",
      },
      {
        name: "MobileForgotPasswordScreen",
        category: "layout",
        modulePath: "layout/forgot-password-screen",
        summary: "One field, and it hands its success state to the status screen.",
      },
      {
        name: "MobileResetPasswordScreen",
        category: "layout",
        modulePath: "layout/reset-password-screen",
        summary: "A strength meter and a confirmation field that must match.",
      },
      {
        name: "MobileOtpVerifyScreen",
        category: "layout",
        modulePath: "layout/otp-verify-screen",
        summary: "Code entry with a resend cooldown and a masked destination.",
      },
      {
        name: "MobileSettingsScreen",
        category: "layout",
        modulePath: "layout/settings-screen",
        summary:
          "Profile header, grouped sections with footers, and a danger zone. `MobileSettingsSection` inserts the row separators for you.",
      },
      {
        name: "MobileStatusScreen",
        category: "layout",
        modulePath: "layout/status-screen",
        summary:
          "Six variants — success, info, warning, error, 404 and maintenance — behind one frame.",
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* Foundations                                                                 */
/* -------------------------------------------------------------------------- */

export interface MobileColorToken {
  token: string
  /** The role this token plays, so the swatch is not just a colour. */
  role: string
  light: string
  dark: string
}

/**
 * The complete `ColorRamp` from `packages/mobile/src/tokens.ts`. Both ramps are
 * closed sets — there is no "add a colour" escape hatch, which is what keeps
 * light and dark from drifting apart.
 */
export const MOBILE_COLOR_TOKENS: MobileColorToken[] = [
  { token: "background", role: "Page surface", light: "#ffffff", dark: "#09090b" },
  { token: "surface", role: "Recessed region", light: "#f8fafc", dark: "#18181b" },
  { token: "card", role: "Raised container", light: "#ffffff", dark: "#121215" },
  { token: "cardBorder", role: "Card hairline", light: "#e2e8f0", dark: "#27272a" },
  { token: "foreground", role: "Primary type", light: "#0f172a", dark: "#f8fafc" },
  { token: "muted", role: "Secondary type", light: "#64748b", dark: "#94a3b8" },
  { token: "mutedBackground", role: "Muted fill", light: "#f1f5f9", dark: "#27272a" },
  { token: "primary", role: "Primary action", light: "#d40c1a", dark: "#ff4d46" },
  { token: "primaryForeground", role: "On primary", light: "#fafafa", dark: "#0a0a0a" },
  { token: "secondary", role: "Secondary action", light: "#f1f5f9", dark: "#27272a" },
  { token: "secondaryForeground", role: "On secondary", light: "#0f172a", dark: "#f8fafc" },
  { token: "accent", role: "Accent fill", light: "#f1f5f9", dark: "#27272a" },
  { token: "accentForeground", role: "On accent", light: "#0f172a", dark: "#f8fafc" },
  { token: "destructive", role: "Destructive action", light: "#ef4444", dark: "#ff6467" },
  { token: "destructiveForeground", role: "On destructive", light: "#ffffff", dark: "#09090b" },
  { token: "success", role: "Success status", light: "#10b981", dark: "#34d399" },
  { token: "successForeground", role: "On success", light: "#ffffff", dark: "#09090b" },
  { token: "warning", role: "Warning status", light: "#f59e0b", dark: "#fbbf24" },
  { token: "warningForeground", role: "On warning", light: "#ffffff", dark: "#09090b" },
  { token: "info", role: "Info status", light: "#3b82f6", dark: "#60a5fa" },
  { token: "infoForeground", role: "On info", light: "#ffffff", dark: "#09090b" },
  { token: "border", role: "Divider", light: "#e2e8f0", dark: "#27272a" },
  { token: "inputBorder", role: "Field outline", light: "#cbd5e1", dark: "#3f3f46" },
  {
    token: "elevationEdge",
    role: "3D edge — neutral",
    light: "#00000026",
    dark: "#ffffff2e",
  },
  { token: "primaryEdge", role: "3D edge — primary", light: "#d40c1a", dark: "#ff4d46" },
  {
    token: "destructiveEdge",
    role: "3D edge — destructive",
    light: "#942626",
    dark: "#9e3b3d",
  },
]

export interface MobileTypeStep {
  variant: string
  size: number
  lineHeight: number
  weight: number
  tracking?: number
  sample: string
}

/** The eight-step ramp from `typography` in `tokens.ts`. */
export const MOBILE_TYPE_SCALE: MobileTypeStep[] = [
  { variant: "display", size: 32, lineHeight: 38, weight: 700, tracking: -0.5, sample: "Display" },
  { variant: "heading", size: 24, lineHeight: 30, weight: 600, tracking: -0.3, sample: "Heading" },
  { variant: "title", size: 19, lineHeight: 24, weight: 600, tracking: -0.2, sample: "Title" },
  { variant: "body", size: 16, lineHeight: 23, weight: 400, sample: "Body — the reading size" },
  { variant: "bodyMedium", size: 16, lineHeight: 23, weight: 500, sample: "Body medium — emphasis" },
  { variant: "callout", size: 14, lineHeight: 18, weight: 500, sample: "Callout — supporting copy" },
  { variant: "caption", size: 12, lineHeight: 16, weight: 400, sample: "Caption — metadata" },
  { variant: "label", size: 11, lineHeight: 14, weight: 600, tracking: 0.3, sample: "LABEL" },
]

export const MOBILE_METRICS = {
  minTouchTarget: 44,
  radii: [
    { token: "sm", value: 6, use: "Buttons, badges, chips" },
    { token: "md", value: 10, use: "Inputs, segmented controls" },
    { token: "lg", value: 14, use: "Cards, grouped lists" },
    { token: "xl", value: 18, use: "Sheets, modals" },
  ],
}

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
    detail: "Everything reads useMobileTheme(); the light and dark ramps are both complete.",
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
    detail: "Prices, timers and counts, so a changing digit does not shift the row.",
  },
  {
    title: "Icons arrive as props",
    detail:
      "The package takes no icon dependency; only structural marks (a tick, a chevron, a magnifier) are drawn inline.",
  },
  {
    title: "No hover-only affordances",
    detail: "There is no hover on a thumb. Anything hidden behind one does not exist.",
  },
  {
    title: "Forms never disable submit for empty fields",
    detail:
      "It stays pressable and names what is missing; it is disabled only while loading.",
  },
  {
    title: "Screens are presentational",
    detail: "Props in, callbacks out — no fetching, no auth client, no routing.",
  },
]

/* -------------------------------------------------------------------------- */
/* Platform support                                                            */
/* -------------------------------------------------------------------------- */

export interface MobilePlatformRow {
  capability: string
  ios: "yes" | "no"
  android: "yes" | "no"
  web: "yes" | "no" | "partial"
  note: string
}

export const MOBILE_PLATFORM: MobilePlatformRow[] = [
  {
    capability: "Components built on @expo/ui",
    ios: "yes",
    android: "yes",
    web: "yes",
    note: "SwiftUI / Compose natively; DOM equivalents through the universal entry",
  },
  {
    capability: "Rest of the package (plain React Native)",
    ios: "yes",
    android: "yes",
    web: "yes",
    note: "via react-native-web",
  },
  {
    capability: "apps/mobile showcase",
    ios: "yes",
    android: "yes",
    web: "yes",
    note: "Metro web bundler, declared in app.json",
  },
]

export interface MobileEntryPoint {
  specifier: string
  implementation: string
  platforms: string
}

/**
 * `@expo/ui@57` exposes three entry points, and *which one you import* decides
 * whether web works. This is the single most misread thing about the package:
 * every module here imports the bare specifier, which is the universal one.
 */
export const MOBILE_ENTRY_POINTS: MobileEntryPoint[] = [
  {
    specifier: "@expo/ui",
    implementation:
      "Universal — resolves to .ios.tsx / .android.tsx / a generic DOM implementation",
    platforms: "iOS · Android · Web",
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

/** What the universal implementations actually are — not stubs. */
export const MOBILE_UNIVERSAL_IMPLEMENTATIONS = [
  { module: "Host", behaviour: "renders a plain View" },
  { module: "Switch", behaviour: "builds a DOM switch" },
  { module: "List / ListItem", behaviour: "plain React Native primitives" },
  { module: "BottomSheet", behaviour: "renders through vaul" },
]

export interface MobileWebCaveat {
  title: string
  detail: string
}

export const MOBILE_WEB_CAVEATS: MobileWebCaveat[] = [
  {
    title: "Props marked @platform ios / @platform android are inert on web",
    detail:
      "MobileList's onRefresh is the one in this package — the prop is accepted and ignored, because there is no native refresh affordance to show.",
  },
  {
    title: "Web is a preview surface, not a port",
    detail:
      "The DOM rendering comes from @expo/ui and react-native-web, so it is close to, but not pixel-identical with, the SwiftUI / Compose rendering. When a feature needs a first-class web implementation, use @celestia-project/ui.",
  },
  {
    title: "Haptics are a no-op in a browser",
    detail:
      "expo-haptics ships ExpoHaptics.web, so every component that calls it keeps working and simply does not buzz.",
  },
]

/** The three packages `apps/mobile` needs for the browser target. */
export const MOBILE_WEB_PACKAGES =
  "npx expo install react-native-web react-dom @expo/metro-runtime"


/* -------------------------------------------------------------------------- */
/* Screen gallery                                                              */
/* -------------------------------------------------------------------------- */

export type MobileScreenId =
  | "sign-in"
  | "onboarding"
  | "settings"
  | "otp-verify"
  | "status"
  | "reset-password"

export interface MobileScreenEntry {
  id: MobileScreenId
  title: string
  modulePath: string
  /** What the screen owns, and what it deliberately does not. */
  summary: string
}

export const MOBILE_SCREENS: MobileScreenEntry[] = [
  {
    id: "sign-in",
    title: "Sign in",
    modulePath: "layout/sign-in-screen",
    summary:
      "Credentials, remember-me, OAuth rows and both cross-links. The screen owns its field state and reports the result — it never authenticates, stores a session or navigates.",
  },
  {
    id: "onboarding",
    title: "Onboarding",
    modulePath: "layout/onboarding-screen",
    summary:
      "A pager with a dot indicator and skip / next / get-started. Paging uses ScrollView + pagingEnabled, not a gesture library.",
  },
  {
    id: "settings",
    title: "Settings",
    modulePath: "layout/settings-screen",
    summary:
      "Profile header, grouped sections with footers, and a danger zone. MobileSettingsSection inserts the row separators, so a stray divider after the last row is impossible.",
  },
  {
    id: "otp-verify",
    title: "OTP verify",
    modulePath: "layout/otp-verify-screen",
    summary:
      "Six-digit entry with a resend cooldown. Digits are clamped to the length and onComplete fires once, so the caller never polls.",
  },
  {
    id: "status",
    title: "Status",
    modulePath: "layout/status-screen",
    summary:
      "One frame behind six outcomes. The accent is mapped from the variant internally, so a supplied icon is the only thing the caller has to tint.",
  },
  {
    id: "reset-password",
    title: "Reset password",
    modulePath: "layout/reset-password-screen",
    summary:
      "A strength meter scored by the same function that gates submit, and a confirmation field that must match before the button commits.",
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
  { id: "foundations", title: "Foundations", group: "Design system" },
  { id: "components", title: "Component index", group: "Design system" },
  { id: "screens", title: "Screens", group: "Design system" },
  { id: "rules", title: "Design rules", group: "Guidance" },
  { id: "platform", title: "Platform support", group: "Guidance" },
  { id: "install", title: "Install", group: "Guidance" },
]
