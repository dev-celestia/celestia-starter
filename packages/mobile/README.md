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
npx expo install @expo/ui expo-haptics
```

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

**primitive** — 8 modules

| Component | Wraps | Notes |
|---|---|---|
| `MobileText` | RN `Text` | 8 typographic roles, `tabular` numerals, semantic `color` |
| `MobileButton` | RN `Pressable` | 5 variants × 3 sizes, `0.97` press scale, haptics |
| `MobileTextInput` | RN `TextInput` | 16px font floor, focus/error borders, `leading`/`trailing` slots |
| `MobileSwitch` | `@expo/ui` `Switch` | real SwiftUI / Jetpack Compose toggle |
| `MobileBadge` | RN `View` | 7 status variants, `tabular` counts |
| `MobileCard` + 5 sub-components | RN `View` | header / title / description / content / footer |
| `MobileList`, `MobileListItem` | `@expo/ui` `List` | native grouped table rows |
| `MobileBottomSheet` | `@expo/ui` `BottomSheet` | native slide-up presentation |

**composite** and **layout** are scaffolded but intentionally empty — see
[`PLAN.md`](./PLAN.md) for the components queued for those categories.

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
