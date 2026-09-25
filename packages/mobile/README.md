# @celestia-project/mobile

Native React Native & Expo UI component suite built on **@expo/ui** (real SwiftUI on iOS and Jetpack Compose on Android), designed for the Celestia monorepo.

## Features

- **Real Native Primitives**: Uses `@expo/ui` to render SwiftUI and Jetpack Compose without JavaScript emulation.
- **Physical Depth & Motion**: Micro-motion press scale (`0.97`) and same-frame haptic feedback via `expo-haptics`.
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

| Category | Directory | What belongs here | Rule of thumb |
|---|---|---|---|
| **primitive** | `src/components/primitive/` | Generic, single-purpose building blocks. Each wraps one native control or one plain surface. | *"Would I reach for this in any app?"* → primitive |
| **composite** | `src/components/composite/` | Opinionated assemblies built from primitives. | *"Is this a `<Primitive>` with a specific job?"* → composite |
| **layout** | `src/components/layout/` | Full-screen shells and screens. Own the frame; take content through slots. | *"Does it own the whole screen?"* → layout |

> **Note on "primitive".** Primitive means *generic*, not *atomic*. A compound component such as
> `MobileCard` — which ships `MobileCardHeader`, `MobileCardTitle`, `MobileCardDescription`,
> `MobileCardContent` and `MobileCardFooter` — is still a primitive, exactly as `Card` is in
> `@celestia-project/ui/primitive`.

`src/tokens.ts` and `src/host.tsx` sit at the package root: they are cross-cutting
infrastructure (design tokens + the theme context every component reads), not components.

### Currently implemented

**primitive** — 20 modules

| Component | Wraps | Notes |
|---|---|---|
| `MobileText` | RN `Text` | 8 typographic roles, `tabular` numerals, semantic `color` |
| `MobileLabel` | RN `Text` | `callout` role, structural required marker |
| `MobileButton` | RN `Pressable` | 5 variants × 3 sizes, `0.97` press scale, haptics |
| `MobileIconButton` | RN `Pressable` | 44pt square, **required** `accessibilityLabel` |
| `MobileTextInput` / `MobileInput` | RN `TextInput` | 16px font floor, focus/error borders, `leading`/`trailing` slots, `clearable` |
| `MobileOtpInput` | RN `TextInput` (single) | fixed-length code cells, SMS autofill, auto-advance |
| `MobileSwitch` | `@expo/ui` `Switch` | real SwiftUI / Jetpack Compose toggle |
| `MobileCheckbox` | RN `Pressable` | drawn tick; the whole row is the touch target |
| `MobileRadioGroup` | RN `Pressable` | `radiogroup` semantics; silent when re-tapping the selection |
| `MobileSlider` | RN `PanResponder` | continuous or stepped, adjustable a11y actions |
| `MobileBadge` | RN `View` | 7 status variants, `tabular` counts |
| `MobileAvatar` | RN `Image` | image → initials → custom fallback |
| `MobileSeparator` | RN `View` | horizontal / vertical, optional centred caption |
| `MobileProgress` | RN `Animated` | determinate + indeterminate (native-driver transform) |
| `MobileSpinner` | RN `ActivityIndicator` | `progressbar` role, optional caption |
| `MobileSkeleton` | RN `Animated` | pulsing placeholder, hidden from assistive tech |
| `MobileLink` | RN `Pressable` | inline and standalone (chevron) variants |
| `MobileCard` + 5 sub-components | RN `View` | header / title / description / content / footer |
| `MobileList`, `MobileListItem` | `@expo/ui` `List` | native grouped table rows |
| `MobileBottomSheet` | `@expo/ui` `BottomSheet` | native slide-up presentation |

**composite** — 13 modules

| Component | Composes | Notes |
|---|---|---|
| `MobileFormField` | `MobileLabel` + control | owns form-field rhythm; the control arrives as `children` |
| `MobileSearchBar` | `MobileTextInput` | drawn magnifier, clear affordance, return-key submit |
| `MobileNavBar` | `MobileText` + slots | `flex: 1/2/1` columns so the title is genuinely centred; `large` variant |
| `MobileTabBar` | `Pressable` + `MobileBadge` | selection keyed on a **required** `key`; badge counts |
| `MobileSegmentedControl` | `Animated` + `Pressable` | native-driver sliding indicator |
| `MobileSettingRow` | `MobileText` + slots | renders a plain `View` when there is no `onPress` |
| `MobileAvatarGroup` | `MobileAvatar` | overlap derived from `mobileAvatarSizes`; `+N` overflow chip |
| `MobileAlert` | `View` + overlay | tone from a 10% overlay, not an alpha token |
| `MobileEmptyState` | `MobileText` + slots | centred panel, `header` semantics |
| `MobileSocialAuthButtons` | `MobileButton` | explicit row chunking rather than `flexWrap` |
| `MobileActionSheet` | `MobileBottomSheet` | dismisses **before** running the action |
| `MobileConfirmDialog` | `MobileBottomSheet` + `MobileButton` | stays open until the caller dismisses it |
| `MobileToast` + `MobileToastProvider` + `useMobileToast` | `Animated` + context | one toast at a time; imperative `show()` / `hide()` |

**layout** — 10 modules

| Component | Owns | Notes |
|---|---|---|
| `MobileScreen` | safe area + scroll + keyboard + header + footer | the base frame; **every** other screen composes it |
| `MobileAuthShell` | logo / heading / form / aside / footer | the frame all five auth screens share |
| `MobileOnboardingScreen` | paged slides + indicator + Skip/Next/Get-started | `ScrollView` + `pagingEnabled`; no gesture library |
| `MobileSignInScreen` | email + password + remember + social | reports through `onSubmit`, never authenticates |
| `MobileSignUpScreen` | name + email + password + terms | password rule and hint read the same number |
| `MobileForgotPasswordScreen` | email + submit + back-to-sign-in | hands off to `MobileStatusScreen` for the "sent" state |
| `MobileResetPasswordScreen` | new password + confirm + strength meter | meter hidden until there is something to measure |
| `MobileOtpVerifyScreen` | code entry + resend cooldown | one rescheduled `setTimeout`, tabular countdown |
| `MobileSettingsScreen` + `MobileSettingsSection` | grouped settings rows | the section inserts the separators, not the caller |
| `MobileStatusScreen` | centred outcome + actions | success / error / warning / info / not-found / maintenance |

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

export function ChangeHandleScreen({ onSave }: { onSave: (handle: string) => void }) {
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

1. **No hardcoded colors.** Everything reads `useMobileTheme()`; light and dark ramps are both complete.
2. **44×44pt minimum touch target** on every interactive element (`metrics.minTouchTarget`).
3. **Haptics fire on the causal commit frame** — `Light` for normal presses, `Medium` for destructive, `selectionAsync` for toggles. Never on mount.
4. **16px font floor** on text inputs, to prevent OS viewport zoom.
5. **Tabular numerals** for counters, prices and timers.
6. **Icons arrive as props.** The package takes no icon dependency; only structural marks (a tick, a chevron) may be drawn inline.
7. **No hover-only affordances.**
8. **Zero extra runtime dependencies.** Paging uses `ScrollView` + `pagingEnabled`, motion uses RN `Animated`, keyboard handling uses `KeyboardAvoidingView` — no `reanimated`, no `gesture-handler`, no navigation library.
9. **Forms never disable the submit button for empty fields.** The button stays pressable and names what is missing; it is disabled only while loading. A dead button with no explanation is the single most common form defect — the user cannot tell whether the form is broken or their input is wrong.
10. **Screens are presentational.** Props in, callbacks out. No fetching, no auth client, no routing — the host app owns all three.

## Verification

```bash
pnpm --filter @celestia-project/mobile typecheck
```

Visual verification needs a simulator or device — `@expo/ui` renders real native
views, so it cannot be checked in a browser. The `apps/mobile` workspace app is the
showcase surface:

```bash
pnpm mobile
```
