# @celestia-project/mobile

Native React Native & Expo UI component suite built on **@expo/ui** (real SwiftUI on iOS and Jetpack Compose on Android), designed for the Celestia monorepo.

## Features

- **Real Native Primitives**: Uses `@expo/ui` to render SwiftUI and Jetpack Compose without JavaScript emulation.
- **Physical Depth & Motion**: Buttons carry the web design system's hard 2px bottom edge (`shadow-3d-*`), and every press fires same-frame haptic feedback via `expo-haptics`.
- **Accessible & Ergonomic**: 44×44pt minimum touch targets and WCAG AA contrast compliance.
- **Mobile-First Typography**: 16px minimum text input font floor and tabular numerals support.
- **Routing & Data Agnostic**: No navigation library, no data fetching, no auth client. Components receive props and emit callbacks.

## Installation

Inside your Expo app or mobile workspace:

```bash
pnpm add @celestia-project/mobile
```

Peer dependencies required by Expo:

```bash
npx expo install @expo/ui expo-haptics react-native-safe-area-context
```

`react-native-safe-area-context` is needed by `MobileScreen` (and therefore by every
screen built on it). Mount a `SafeAreaProvider` at the app root; without one the insets
resolve to zero and screens still render, just without safe-area padding.

## Component categories

Components are grouped by **role**, not by atomicity — the same taxonomy used by
`@celestia-project/ui`, so the two libraries read the same way.

| Category      | Directory                   | What belongs here                                                                                                    | Rule of thumb                                                |
| ------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **primitive** | `src/components/primitive/` | Generic, single-purpose building blocks. Each wraps one native control or one plain surface.                         | _"Would I reach for this in any app?"_ → primitive           |
| **composite** | `src/components/composite/` | Opinionated assemblies built from primitives.                                                                        | _"Is this a `<Primitive>` with a specific job?"_ → composite |
| **ai**        | `src/components/ai/`        | Assistant, agent and generative surfaces — transcript, composer, model and context controls, grounding and feedback. | _"Does it only make sense next to a model?"_ → ai            |
| **layout**    | `src/components/layout/`    | Full-screen shells and screens. Own the frame; take content through slots.                                           | _"Does it own the whole screen?"_ → layout                   |

> **Note on "primitive".** Primitive means _generic_, not _atomic_. A compound component such as
> `MobileCard` — which ships `MobileCardHeader`, `MobileCardTitle`, `MobileCardDescription`,
> `MobileCardContent` and `MobileCardFooter` — is still a primitive, exactly as `Card` is in
> `@celestia-project/ui/primitive`.

`src/tokens.ts` and `src/host.tsx` sit at the package root: they are cross-cutting
infrastructure (design tokens + the theme context every component reads), not components.

### Currently implemented

Each heading gives the **category total**; the tables below it list a representative index rather
than every module. The docs site (`/docs/mobile`) carries the full list.

| Category | Modules |
|---|---|
| primitive | **52** |
| composite | **58** |
| ai | **27** |
| layout | **20** |
| **total** | **157** |

**primitive** — 52 modules

| Component                         | Wraps                    | Notes                                                                                           |
| --------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| `MobileText`                      | RN `Text`                | 8 typographic roles, `tabular` numerals, semantic `color`                                       |
| `MobileLabel`                     | RN `Text`                | `callout` role, structural required marker                                                      |
| `MobileButton`                    | RN `Pressable`           | 5 variants × 3 sizes; web `Button` anatomy (32px surface, 6px radius, 2px bottom edge), haptics |
| `MobileIconButton`                | RN `Pressable`           | 44pt square, **required** `accessibilityLabel`                                                  |
| `MobileTextInput` / `MobileInput` | RN `TextInput`           | 16px font floor, focus/error borders, `leading`/`trailing` slots, `clearable`                   |
| `MobileOtpInput`                  | RN `TextInput` (single)  | fixed-length code cells, SMS autofill, auto-advance                                             |
| `MobileSwitch`                    | RN `Animated`            | drawn toggle — spring thumb travel, crossfading track                                           |
| `MobileCheckbox`                  | RN `Pressable`           | drawn tick; the whole row is the touch target                                                   |
| `MobileRadioGroup`                | RN `Pressable`           | `radiogroup` semantics; silent when re-tapping the selection                                    |
| `MobileSlider`                    | RN `PanResponder`        | continuous or stepped, adjustable a11y actions                                                  |
| `MobileBadge`                     | RN `View`                | 7 status variants, `tabular` counts                                                             |
| `MobileAvatar`                    | RN `Image`               | image → initials → custom fallback                                                              |
| `MobileSeparator`                 | RN `View`                | horizontal / vertical, optional centred caption                                                 |
| `MobileProgress`                  | RN `Animated`            | determinate + indeterminate (native-driver transform)                                           |
| `MobileSpinner`                   | RN `ActivityIndicator`   | `progressbar` role, optional caption                                                            |
| `MobileSkeleton`                  | RN `Animated`            | pulsing placeholder, hidden from assistive tech                                                 |
| `MobileLink`                      | RN `Pressable`           | inline and standalone (chevron) variants                                                        |
| `MobileCard` + 5 sub-components   | RN `View`                | header / title / description / content / footer                                                 |
| `MobileList`, `MobileListItem`    | `@expo/ui` `List`        | native grouped table rows                                                                       |
| `MobileBottomSheet`               | `@expo/ui` `BottomSheet` | native slide-up presentation                                                                    |

**composite** — 58 modules

| Component                                                | Composes                             | Notes                                                                        |
| -------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `MobileFormField`                                        | `MobileLabel` + control              | owns form-field rhythm; the control arrives as `children`                    |
| `MobileSearchBar`                                        | `MobileTextInput`                    | drawn magnifier, clear affordance, return-key submit                         |
| `MobileNavBar`                                           | `MobileText` + slots                 | `flex: 1/2/1` columns so the title is genuinely centred; `large` variant     |
| `MobileTabBar`                                           | `Pressable` + `MobileBadge`          | selection keyed on a **required** `key`; badge counts                        |
| `MobileSegmentedControl`                                 | `Animated` + `Pressable`             | native-driver sliding indicator                                              |
| `MobileSettingRow`                                       | `MobileText` + slots                 | renders a plain `View` when there is no `onPress`                            |
| `MobileAvatarGroup`                                      | `MobileAvatar`                       | overlap derived from `mobileAvatarSizes`; `+N` overflow chip                 |
| `MobileAlert`                                            | `View` + overlay                     | tone from a 10% overlay, not an alpha token                                  |
| `MobileEmptyState`                                       | `MobileText` + slots                 | centred panel, `header` semantics                                            |
| `MobileSocialAuthButtons`                                | `MobileButton`                       | explicit row chunking rather than `flexWrap`                                 |
| `MobileActionSheet`                                      | `MobileBottomSheet`                  | dismisses **before** running the action                                      |
| `MobileConfirmDialog`                                    | `MobileBottomSheet` + `MobileButton` | stays open until the caller dismisses it                                     |
| `MobileChartScatter`                                     | `victory-native` over Skia           | the only module with dependencies — optional peers; one `Scatter` per series |
| `MobileToast` + `MobileToastProvider` + `useMobileToast` | `Animated` + context                 | one toast at a time; imperative `show()` / `hide()`                          |

**ai** — 27 modules

| Component                 | Composes                              | Notes                                                                                |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `MobileAiMessage`         | `MobileStreamingText`                 | role-aware turn — user bubble, unboxed assistant row, centred system note, tool card |
| `MobileStreamingText`     | `MobileText` + `Animated.Text`        | inline blinking caret while tokens arrive                                            |
| `MobileTypingIndicator`   | `Animated`                            | three-dot wave, one loop per dot so the phase never drifts                           |
| `MobileAiSkeletonMessage` | `MobileSkeleton`                      | reserves the answer's shape so the layout does not jump                              |
| `MobileAiAvatar`          | `Animated`                            | idle / thinking / streaming / speaking / error; pulses a ring, never resizes one     |
| `MobileThinkingBlock`     | `MobileCollapsible`                   | collapsible reasoning trace, collapsed and uncontrolled by default                   |
| `MobileToolCallCard`      | `MobileCollapsible` + `MobileSpinner` | tool name, arguments, result, lifecycle status; opens itself while running           |
| `MobileCodeBlock`         | `MobileAiCopyButton`                  | monospace output, horizontal scroll, `maxLines` truncation with a named remainder    |
| `MobileCitationChip`      | `Pressable`                           | the inline `[3]` marker; vertical-only `hitSlop`                                     |
| `MobileSourceList`        | `Pressable`                           | numbered bibliography; plain rows when there is no `onSelect`                        |
| `MobileAiFeedbackBar`     | `Pressable`                           | copy / regenerate / share / thumbs, with a reversible rating                         |
| `MobileAiCopyButton`      | `Pressable`                           | owns the confirmation, not the clipboard — `onCopy` is the consumer's                |
| `MobileAiErrorCard`       | `MobileButton`                        | per-kind title and fix; retry hidden where it cannot help                            |
| `MobileAiDisclaimer`      | `MobileText`                          | the standing "AI can make mistakes" notice                                           |
| `MobilePromptInput`       | `MobileTextInput`                     | attachments, model chip, send ⇄ stop in place                                        |
| `MobileAttachmentTray`    | `ScrollView`                          | fixed-height chips so the composer never reflows                                     |
| `MobileVoiceButton`       | `MobileSpinner`                       | tap-to-start or push-to-talk; drawn mic glyph                                        |
| `MobileAudioWaveform`     | `Animated`                            | `scaleY`-animated bars, one loop each, optional playhead tint                        |
| `MobileStopButton`        | `Pressable`                           | medium haptic — aborting is a destructive commit                                     |
| `MobileModelSelector`     | `ScrollView` / list                   | pill row for the composer, described list for settings; locked tiers stay visible    |
| `MobileTokenMeter`        | `MobileProgress`                      | context-window usage; tone escalates `muted` → `warning` → `destructive`             |
| `MobileSuggestionChips`   | `MobileChip`                          | wraps instead of scrolling, so no suggestion hides off-screen                        |
| `MobilePromptGallery`     | `MobilePressableScale`                | starter-prompt grid; 1- or 2-column                                                  |
| `MobileAgentCard`         | `MobilePressableScale`                | agent / persona picker with a capability tag row                                     |
| `MobileAgentTaskRow`      | `MobileSpinner`                       | one step on a vertical rail; explicit `connector` flag                               |
| `MobileAiUsageCard`       | `MobileProgress` + `MobileButton`     | plan and quota; upgrade omitted rather than disabled                                 |
| `MobileImageResultCard`   | `MobileSkeleton` + `MobileSpinner`    | aspect-ratio-reserved image frame with overlay actions                               |

**layout** — 20 modules

| Component                                        | Owns                                             | Notes                                                      |
| ------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------- |
| `MobileScreen`                                   | safe area + scroll + keyboard + header + footer  | the base frame; **every** other screen composes it         |
| `MobileAuthShell`                                | logo / heading / form / aside / footer           | the frame all five auth screens share                      |
| `MobileOnboardingScreen`                         | paged slides + indicator + Skip/Next/Get-started | `ScrollView` + `pagingEnabled`; no gesture library         |
| `MobileSignInScreen`                             | email + password + remember + social             | reports through `onSubmit`, never authenticates            |
| `MobileSignUpScreen`                             | name + email + password + terms                  | password rule and hint read the same number                |
| `MobileForgotPasswordScreen`                     | email + submit + back-to-sign-in                 | hands off to `MobileStatusScreen` for the "sent" state     |
| `MobileResetPasswordScreen`                      | new password + confirm + strength meter          | meter hidden until there is something to measure           |
| `MobileOtpVerifyScreen`                          | code entry + resend cooldown                     | one rescheduled `setTimeout`, tabular countdown            |
| `MobileSettingsScreen` + `MobileSettingsSection` | grouped settings rows                            | the section inserts the separators, not the caller         |
| `MobileStatusScreen`                             | centred outcome + actions                        | success / error / warning / info / not-found / maintenance |

### Screens in practice

Every auth screen is **presentational**: props in, callbacks out. No fetching, no auth
client, no routing — the host app owns all three.

```tsx
import { MobileSignInScreen } from "@celestia-project/mobile"

export default function SignIn() {
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  return (
    <MobileSignInScreen
      error={error}
      loading={loading}
      socialProviders={[
        { id: "google", label: "Google" },
        { id: "apple", label: "Apple" },
      ]}
      onForgotPassword={() => router.push("/forgot-password")}
      onSignUp={() => router.push("/sign-up")}
      onSubmit={async ({ email, password }) => {
        setLoading(true)
        setError(undefined)
        try {
          await auth.signIn(email, password)
          router.replace("/")
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Sign-in failed.")
        } finally {
          setLoading(false)
        }
      }}
    />
  )
}
```

A screen that resembles an existing one **composes the shell** — it never re-implements
the header. That is what stops six auth screens from drifting apart:

```tsx
import { MobileAuthShell, MobileButton } from "@celestia-project/mobile"

export function ChangeHandleScreen({
  onSave,
}: {
  onSave: (handle: string) => void
}) {
  const [handle, setHandle] = useState("")

  return (
    <MobileAuthShell
      heading="Choose a handle"
      subheading="This is how others will find you."
      onBack={() => history.back()}
    >
      {/* fields… */}
      <MobileButton onPress={() => onSave(handle)}>Save</MobileButton>
    </MobileAuthShell>
  )
}
```

## Import paths

```tsx
// Barrel — every category
import { MobileButton, MobileCard, MobileHost } from "@celestia-project/mobile"

// One category
import { MobileButton } from "@celestia-project/mobile/primitive"
import { MobilePromptInput } from "@celestia-project/mobile/ai"

// One component
import { MobileButton } from "@celestia-project/mobile/primitive/button"

// Infrastructure
import { useMobileTheme } from "@celestia-project/mobile/host"
import { darkColors, metrics } from "@celestia-project/mobile/tokens"
```

## Quick Start

Wrap your screen with `MobileHost` — it bridges React Native to the native layer via
`@expo/ui` and provides the theme context every component reads:

```tsx
import React, { useState } from "react"
import { ScrollView } from "react-native"
import {
  MobileHost,
  MobileButton,
  MobileText,
  MobileTextInput,
  MobileSwitch,
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardContent,
  MobileBottomSheet,
} from "@celestia-project/mobile"

export default function MyScreen() {
  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState(true)

  return (
    <MobileHost>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <MobileText variant="heading">Celestia Mobile</MobileText>

        <MobileCard style={{ marginTop: 12 }}>
          <MobileCardHeader>
            <MobileCardTitle>Preferences</MobileCardTitle>
          </MobileCardHeader>
          <MobileCardContent>
            <MobileSwitch
              label="Enable Notifications"
              value={enabled}
              onValueChange={setEnabled}
            />
          </MobileCardContent>
        </MobileCard>

        <MobileButton
          variant="default"
          onPress={() => setOpen(true)}
          style={{ marginTop: 16 }}
        >
          Open Bottom Sheet
        </MobileButton>

        <MobileBottomSheet
          isPresented={open}
          onDismiss={() => setOpen(false)}
          snapPoints={["half", "full"]}
        >
          <MobileText variant="title">Native Sheet</MobileText>
        </MobileBottomSheet>
      </ScrollView>
    </MobileHost>
  )
}
```

## Design rules

Every component in this package follows the same non-negotiables:

1. **No hardcoded colors.** Everything reads `useMobileTheme()`; light and dark ramps are both complete. `tokens.ts` is the only file in the package where a hex literal belongs — a `shadowColor` or a scrim counts, and both are tokens now.
2. **Status hues have a luminance ceiling of `L_rel <= 0.18333`.** Each of the four status hues is both a *fill* carrying white ink (`MobileBadge`, `MobileTag`, `MobileButton`) and *ink* on a near-white backdrop (`MobileAlert` title, form errors, `MobileProgress` fill). Both roles reduce to the same inequality — `1.05 / (L + 0.05) >= 4.5` — so one value per hue serves both and no token family needs splitting. **Do not lighten a status hue past the ceiling.** The ramp that did failed 19 WCAG AA pairings in light mode while dark passed every one.
3. **Derived tokens must be re-derived.** `destructiveEdge` is the sRGB bake of the web token layer's `--shadow-destructive-3d` (`color-mix(in oklch, destructive, black 30%)`). Change `destructive` and the button's 2px bottom edge must move with it, or the edge stops reading as a thickened border.
4. **An escalating gauge needs a perceptible step.** `MobileTokenMeter` walks `muted` → `warning` → `destructive` on a 4pt bar, so adjacent steps must differ in contrast *or* hue. The luminance ceiling in rule 2 pins both status hues to the same lightness, which is why `destructive` sits a full ramp step below `warning`.
5. **Spacing comes from `spacing`.** Five steps — `inline` 4, `label` 8, `row` 12, `block` 16, `section` 32 — exported from `tokens.ts`. The component layer predates the export and still carries off-scale literals; `pnpm audit:ui` prints the census each run so the remaining debt stays visible.
6. **44×44pt minimum touch target** on every interactive element (`metrics.minTouchTarget`). A control drawn shorter to match the web design system — `MobileButton` is 32px, `MobileSegmentedControl`'s segments are 36px — meets the floor with `hitSlop` (`hitSlopFor()` in `src/utils.ts` computes it) rather than by inflating the box. Vertical only: horizontal slop bleeds into siblings.
7. **Haptics fire on the causal commit frame** — `hapticLight()` for normal presses, `hapticMedium()` for destructive, `hapticSelect()` for toggles (all in `src/utils.ts`). Never on mount.
8. **16px font floor** on text inputs, to prevent OS viewport zoom.
9. **Tabular numerals** for counters, prices and timers.
10. **Icons arrive as props.** The package takes no icon dependency; only structural marks (a tick, a chevron) may be drawn inline. The `apps/mobile` showcase is the consumer side of this rule and supplies its own set — Heroicons drawn with `react-native-svg`. The package footprint is unchanged: nothing here needs an icon library.
11. **No hover-only affordances.**
12. **Zero runtime dependencies, with one declared exception.** Paging uses `ScrollView` + `pagingEnabled`, motion uses RN `Animated`, keyboard handling uses `KeyboardAvoidingView`, and `MobileSlider` is built on `PanResponder`. The exception is `MobileChartScatter`, which renders through `victory-native` on Skia — those four packages are **optional** peer dependencies, so an app that draws no chart installs none of them.
13. **Forms never disable the submit button for empty fields.** The button stays pressable and names what is missing; it is disabled only while loading. A dead button with no explanation is the single most common form defect — the user cannot tell whether the form is broken or their input is wrong.
14. **Screens are presentational.** Props in, callbacks out. No fetching, no auth client, no routing — the host app owns all three.
15. **One font family is named, and only for output.** `components/ai/` exports `mobileMonoFont` — the monospace face the code and tool blocks render in. Every other component inherits the platform's system font. The design system declares no mono role, so the constant lives beside the components that need it rather than in `tokens.ts`, where it would drift from the web ramp.

## Verification

```bash
# the colour ramp, both themes -- 38 assertions, control-first
pnpm audit:ui

# or just the mobile half
node scripts/ui-audit/mobile-contrast.mjs --all

# types
pnpm --filter @celestia-project/mobile typecheck
```

`mobile-contrast.mjs` reads `lightColors` / `darkColors` out of `tokens.ts` rather than restating
them, runs a known-good control first, and prints the spacing census. It is wired into
`pnpm audit:ui` alongside the five web checks.

Visual verification still needs a simulator or device — `@expo/ui` renders real native
views, so it cannot be checked in a browser. The `apps/mobile` workspace app is the
showcase surface:

```bash
pnpm mobile
```
