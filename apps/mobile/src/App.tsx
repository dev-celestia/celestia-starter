import * as React from "react"
import { ScrollView, View, StyleSheet, TouchableOpacity } from "react-native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import {
  MobileHost,
  MobileButton,
  MobileText,
  MobileTextInput,
  MobileSwitch,
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardDescription,
  MobileCardContent,
  MobileCardFooter,
  MobileBottomSheet,
  MobileBadge,
  MobileList,
  MobileListItem,
} from "@celestia-project/mobile"

export default function App() {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark")
  const [switchVal, setSwitchVal] = React.useState(true)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [inputText, setInputText] = React.useState("")
  const [counter, setCounter] = React.useState(42)

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const isDark = theme === "dark"
  const screenBg = isDark ? "#09090b" : "#ffffff"

  return (
    <SafeAreaProvider>
      <MobileHost forcedTheme={theme}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: screenBg }]}
          edges={["top", "bottom"]}
        >
          <StatusBar style={isDark ? "light" : "dark"} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Bar / Brand */}
            <View style={styles.headerRow}>
              <View>
                <MobileText variant="caption" color="muted">
                  CELESTIA STARTER
                </MobileText>
                <MobileText variant="heading">Mobile Showcase</MobileText>
              </View>
              <TouchableOpacity
                onPress={toggleTheme}
                style={[
                  styles.themeButton,
                  { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                ]}
              >
                <MobileText variant="caption" style={{ fontWeight: "600" }}>
                  {isDark ? "☀️ Light" : "🌙 Dark"}
                </MobileText>
              </TouchableOpacity>
            </View>

            {/* Section 1: Typography & Tabular Numerals */}
            <View style={styles.section}>
              <MobileText
                variant="caption"
                color="muted"
                style={styles.sectionLabel}
              >
                1. TYPOGRAPHY & TABULAR NUMBERS
              </MobileText>
              <MobileCard>
                <MobileCardHeader>
                  <MobileCardTitle>Proportional Type Scale</MobileCardTitle>
                  <MobileCardDescription>
                    Aligned with better-typography scale & tabular numbers.
                  </MobileCardDescription>
                </MobileCardHeader>
                <MobileCardContent>
                  <MobileText variant="display">Display 32</MobileText>
                  <MobileText variant="heading">Heading 24</MobileText>
                  <MobileText variant="title">Title 19</MobileText>
                  <MobileText
                    variant="body"
                    color="muted"
                    style={{ marginTop: 4 }}
                  >
                    Body 16: Fluid text with proportional line-height and WCAG
                    AA contrast.
                  </MobileText>
                  <View style={styles.counterRow}>
                    <MobileText variant="bodyMedium">
                      Dynamic Counter:
                    </MobileText>
                    <MobileBadge variant="info" tabular>
                      {counter.toString()}
                    </MobileBadge>
                    <MobileButton
                      size="sm"
                      variant="outline"
                      onPress={() => setCounter((c) => c + 1)}
                    >
                      +1 Tick
                    </MobileButton>
                  </View>
                </MobileCardContent>
              </MobileCard>
            </View>

            {/* Section 2: Buttons & Haptics */}
            <View style={styles.section}>
              <MobileText
                variant="caption"
                color="muted"
                style={styles.sectionLabel}
              >
                2. BUTTONS & MICRO-MOTION
              </MobileText>
              <MobileCard>
                <MobileCardHeader>
                  <MobileCardTitle>Touch Ergonomics</MobileCardTitle>
                  <MobileCardDescription>
                    44×44pt touch floor, 0.97 press-scale, and same-frame
                    haptics.
                  </MobileCardDescription>
                </MobileCardHeader>
                <MobileCardContent>
                  <View style={styles.buttonStack}>
                    <MobileButton
                      variant="default"
                      onPress={() => console.log("Default button pressed")}
                    >
                      Primary Action (Light Haptic)
                    </MobileButton>
                    <MobileButton
                      variant="secondary"
                      onPress={() => console.log("Secondary button pressed")}
                    >
                      Secondary Action
                    </MobileButton>
                    <MobileButton
                      variant="outline"
                      onPress={() => console.log("Outline button pressed")}
                    >
                      Outline Action
                    </MobileButton>
                    <MobileButton
                      variant="destructive"
                      onPress={() => console.log("Destructive button pressed")}
                    >
                      Destructive Action (Medium Haptic)
                    </MobileButton>
                    <MobileButton
                      variant="ghost"
                      onPress={() => console.log("Ghost button pressed")}
                    >
                      Ghost Button
                    </MobileButton>
                  </View>
                </MobileCardContent>
              </MobileCard>
            </View>

            {/* Section 3: Inputs & Switches */}
            <View style={styles.section}>
              <MobileText
                variant="caption"
                color="muted"
                style={styles.sectionLabel}
              >
                3. CONTROLS & INPUTS
              </MobileText>
              <MobileCard>
                <MobileCardHeader>
                  <MobileCardTitle>Form Primitives</MobileCardTitle>
                  <MobileCardDescription>
                    16px font floor to avoid OS viewport shifts, native @expo/ui
                    switch.
                  </MobileCardDescription>
                </MobileCardHeader>
                <MobileCardContent>
                  <MobileTextInput
                    placeholder="Enter your email address"
                    value={inputText}
                    onChangeText={setInputText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <View style={{ height: 12 }} />
                  <MobileSwitch
                    label="Push Notifications"
                    description="Real SwiftUI & Compose toggle via @expo/ui"
                    value={switchVal}
                    onValueChange={setSwitchVal}
                  />
                </MobileCardContent>
              </MobileCard>
            </View>

            {/* Section 4: Grouped Native List Rows */}
            <View style={styles.section}>
              <MobileText
                variant="caption"
                color="muted"
                style={styles.sectionLabel}
              >
                4. GROUPED NATIVE LIST ROWS (@expo/ui)
              </MobileText>
              <MobileList>
                <MobileListItem
                  supportingText="English (United States)"
                  onPress={() => console.log("Language tapped")}
                >
                  System Language
                </MobileListItem>
                <MobileListItem
                  supportingText={
                    isDark ? "Dark theme active" : "Light theme active"
                  }
                  onPress={toggleTheme}
                >
                  Color Theme
                </MobileListItem>
                <MobileListItem
                  supportingText="Connected"
                  onPress={() => console.log("Status tapped")}
                >
                  Network Status
                </MobileListItem>
              </MobileList>
            </View>

            {/* Section 5: Badges & Semantic Status */}
            <View style={styles.section}>
              <MobileText
                variant="caption"
                color="muted"
                style={styles.sectionLabel}
              >
                5. BADGES & STATUS RAMPS
              </MobileText>
              <MobileCard>
                <MobileCardContent>
                  <View style={styles.badgeWrap}>
                    <MobileBadge variant="default">Default</MobileBadge>
                    <MobileBadge variant="secondary">Secondary</MobileBadge>
                    <MobileBadge variant="success">Success</MobileBadge>
                    <MobileBadge variant="warning">Warning</MobileBadge>
                    <MobileBadge variant="info">Info</MobileBadge>
                    <MobileBadge variant="destructive">Destructive</MobileBadge>
                    <MobileBadge variant="outline">Outline</MobileBadge>
                  </View>
                </MobileCardContent>
              </MobileCard>
            </View>

            {/* Section 6: Native Bottom Sheet */}
            <View style={styles.section}>
              <MobileText
                variant="caption"
                color="muted"
                style={styles.sectionLabel}
              >
                6. NATIVE PRESENTATION (BOTTOM SHEET)
              </MobileText>
              <MobileButton
                variant="default"
                onPress={() => setSheetOpen(true)}
              >
                Open Native BottomSheet
              </MobileButton>
            </View>

            {/* Interactive Bottom Sheet */}
            <MobileBottomSheet
              isPresented={sheetOpen}
              onDismiss={() => setSheetOpen(false)}
              snapPoints={["half", "full"]}
            >
              <MobileText variant="title">Native Slide-Up Sheet</MobileText>
              <MobileText variant="body" color="muted" style={{ marginTop: 8 }}>
                Rendered with real native platform presentation: SwiftUI on iOS
                and Jetpack Compose on Android.
              </MobileText>
              <View style={{ marginTop: 20 }}>
                <MobileButton
                  variant="secondary"
                  onPress={() => setSheetOpen(false)}
                >
                  Dismiss Sheet
                </MobileButton>
              </View>
            </MobileBottomSheet>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </MobileHost>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 8,
  },
  themeButton: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  buttonStack: {
    gap: 10,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
})
