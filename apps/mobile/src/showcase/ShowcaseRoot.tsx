import * as React from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  MobileButton,
  MobileText,
  useMobileTheme,
} from "@celestia-project/mobile"
import { findScreenPreview } from "./screens-preview"
import { SHOWCASE_SECTIONS } from "./sections"
import type { ShowcaseContext } from "./types"
import { ShowcaseSectionHeader, Spacer } from "./ui"

/**
 * The showcase shell.
 *
 * It owns the two pieces of state the gallery needs — the active colour scheme
 * (lifted to `App.tsx` so it can be forced onto `MobileHost`) and the currently
 * open screen preview — and nothing else.
 *
 * The preview is rendered **instead of** the gallery, never on top of it. The
 * layout screens provide their own safe-area padding and their own scroll view,
 * so mounting one inside the gallery's `SafeAreaView` would inset it twice and
 * make every screen look subtly wrong in a way that is easy to blame on the
 * component.
 */

export interface ShowcaseRootProps {
  /** Flip the forced colour scheme. The scheme itself lives in `App.tsx`. */
  onToggleTheme: () => void
}

export function ShowcaseRoot({ onToggleTheme }: ShowcaseRootProps) {
  const { colorScheme, colors } = useMobileTheme()
  const [previewKey, setPreviewKey] = React.useState<string | null>(null)

  // An unknown key resolves to `undefined` and falls through to the gallery,
  // which is a better failure mode than a blank screen.
  const preview = previewKey === null ? undefined : findScreenPreview(previewKey)

  const openPreview = React.useCallback((key: string) => {
    setPreviewKey(key)
  }, [])

  const closePreview = React.useCallback(() => {
    setPreviewKey(null)
  }, [])

  const ctx = React.useMemo<ShowcaseContext>(
    () => ({ openPreview, scheme: colorScheme }),
    [openPreview, colorScheme]
  )

  // The status bar has to invert with the theme, or it disappears into the
  // background in one of the two schemes.
  const statusBarStyle = colorScheme === "dark" ? "light" : "dark"

  if (preview) {
    return (
      <>
        <StatusBar style={statusBarStyle} />
        {preview.render({ onClose: closePreview })}
      </>
    )
  }

  return (
    <SafeAreaView
      style={[styles.gallery, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar style={statusBarStyle} />

      <ScrollView
        contentContainerStyle={styles.galleryContent}
        showsVerticalScrollIndicator={false}
        // Without this, the first tap after focusing a field only dismisses the
        // keyboard and the user has to tap a second time to hit the control.
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <MobileText variant="label" color="muted">
              CELESTIA STARTER
            </MobileText>
            <MobileText variant="display">Mobile UI</MobileText>
          </View>
          <MobileButton variant="outline" size="sm" onPress={onToggleTheme}>
            {colorScheme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </MobileButton>
        </View>

        <MobileText variant="callout" color="muted">
          Every module in @celestia-project/mobile, grouped by role. Tap any
          screen in the last section to open it full-screen.
        </MobileText>

        {SHOWCASE_SECTIONS.map((section, index) => (
          <View key={section.key}>
            <ShowcaseSectionHeader
              index={index + 1}
              title={section.title}
              summary={section.summary}
            />
            <section.Component ctx={ctx} />
          </View>
        ))}

        <Spacer size={40} />

        <MobileText variant="caption" color="muted" align="center">
          {`${SHOWCASE_SECTIONS.length} sections · 43 modules · 139 exports`}
        </MobileText>
        <Spacer size={16} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  gallery: {
    flex: 1,
  },
  galleryContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
})
