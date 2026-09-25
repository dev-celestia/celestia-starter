# @celestia-project/mobile

Native React Native & Expo UI component suite built on **@expo/ui** (real SwiftUI on iOS and Jetpack Compose on Android), designed for the Celestia monorepo.

## Features

- **Real Native Primitives**: Uses `@expo/ui` to render SwiftUI and Jetpack Compose without JavaScript emulation.
- **Physical Depth & Motion**: Micro-motion press scale (`0.97`) and same-frame haptic feedback via `expo-haptics`.
- **Accessible & Ergonomic**: 44×44pt minimum touch targets and WCAG AA contrast compliance.
- **Mobile-First Typography**: 16px minimum text input font floor and tabular numerals support.

## Installation

Inside your Expo app or mobile workspace:

```bash
pnpm add @celestia-project/mobile
```

Peer dependencies required by Expo:

```bash
npx expo install @expo/ui expo-haptics
```

## Quick Start

Wrap your screen with `MobileHost`:

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
