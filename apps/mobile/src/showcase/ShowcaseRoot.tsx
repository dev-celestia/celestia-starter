import * as React from "react"
import { Animated, ScrollView, StyleSheet, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  MobileButton,
  MobileCard,
  MobileCardDescription,
  MobileCardHeader,
  MobileCardTitle,
  MobileNavBar,
  MobilePressableScale,
  MobileText,
  SPRING_ENTRANCE,
  springTo,
  useMobileTheme,
} from "@celestia-project/mobile"
import { findScreenPreview } from "./screens-preview"
import { SHOWCASE_SECTIONS } from "./sections"
import type { ShowcaseContext } from "./types"
import { SPACE, Spacer } from "./ui"

/**
 * The showcase shell.
 *
 * Three kinds of page live in a small stack:
 *
 * - **home** — the browse menu: one launcher card per section.
 * - **section** — one section's specimens on their own page.
 * - **preview** — a full-screen layout module, opened from the Screens section.
 *
 * Navigation is a **single bottom bar owned by the shell, not by the pages**.
 * The back affordance, the current title and the theme toggle therefore sit in
 * the same place on every screen instead of moving around with the route, and
 * the bar lives outside the stack so pushing a section does not slide it.
 * Previews hide it: they own their whole frame.
 *
 * The stack is hand-rolled rather than a router for the same reason the
 * showcase smuggles no other dependency: it is a demo host, and the three
 * routes above are all it will ever need.
 *
 * The rule that gives the navigation its behaviour: **covered pages stay
 * mounted.** Every page is an opaque absolute-fill box and later siblings draw
 * on top, so a covered page keeps its scroll view — and its scroll offset —
 * alive underneath. Going back therefore never re-mounts what was underneath
 * and never resets it to the top. That is the fix for the old single-scroll
 * gallery, whose full-screen previews *replaced* it and unmounted the scroll
 * position with it.
 *
 * This is also where the old jump menu died. It was a `MobileBottomSheet`,
 * which hosts a real SwiftUI / Compose presentation: React Native children
 * render inside a hosted sheet but never receive touches, so its rows were
 * dead on device. The browse menu is now an ordinary page of ordinary
 * pressables, which is clickable on every platform by construction.
 *
 * Layout screens provide their own safe-area padding and their own scroll
 * view, so a preview renders as its own layer — never inside a section page's
 * `SafeAreaView`, which would inset it twice.
 */

/**
 * The gallery's maximum column width.
 *
 * These are *mobile* components, so an unconstrained column misrepresents them:
 * at a desktop viewport the cards ran the full width, which stretched every
 * description to a 120-character line. Capping the column keeps the specimens
 * at the width they are designed for at every viewport.
 *
 * 640 is the largest width at which a specimen's inner rows — a label column
 * plus a control — still read as a pair rather than as two distant columns.
 */
const COLUMN_MAX_WIDTH = 640

/** One entry in the page stack. The bottom of the stack is always `home`. */
type Route =
  | { kind: "home" }
  | { kind: "section"; key: string }
  | { kind: "preview"; key: string }

/** Stable React key for a stack entry, so covered pages never remount. */
function routeKey(route: Route): string {
  switch (route.kind) {
    case "home":
      return "home"
    case "section":
      return `section:${route.key}`
    case "preview":
      return `preview:${route.key}`
  }
}

export interface ShowcaseRootProps {
  /** Flip the forced colour scheme. The scheme itself lives in `App.tsx`. */
  onToggleTheme: () => void
}

export function ShowcaseRoot({ onToggleTheme }: ShowcaseRootProps) {
  const { colorScheme } = useMobileTheme()
  const [stack, setStack] = React.useState<Route[]>([{ kind: "home" }])

  const push = React.useCallback((route: Route) => {
    setStack((current) => [...current, route])
  }, [])

  const pop = React.useCallback(() => {
    setStack((current) => (current.length > 1 ? current.slice(0, -1) : current))
  }, [])

  const openSection = React.useCallback(
    (key: string) => push({ kind: "section", key }),
    [push]
  )

  const openPreview = React.useCallback(
    (key: string) => push({ kind: "preview", key }),
    [push]
  )

  const ctx = React.useMemo<ShowcaseContext>(
    () => ({ openPreview, scheme: colorScheme }),
    [openPreview, colorScheme]
  )

  // The status bar has to invert with the theme, or it disappears into the
  // background in one of the two schemes.
  const statusBarStyle = colorScheme === "dark" ? "light" : "dark"

  const top = stack[stack.length - 1]
  const canGoBack = stack.length > 1

  // A preview owns its whole frame *and* its own safe-area padding, so the
  // shared bar would inset it a second time; the layout screens carry their own
  // close affordance instead.
  const showBar = top?.kind !== "preview"
  // "Browse", not "Mobile UI": the bar names where you are, and the home page
  // already carries the app name as its `display` heading directly above it.
  // It also pairs with the back affordance's own label.
  const title =
    top?.kind === "section"
      ? (SHOWCASE_SECTIONS.find((item) => item.key === top.key)?.title ??
        "Browse")
      : "Browse"

  return (
    <View style={styles.root}>
      <StatusBar style={statusBarStyle} />

      {/* The stack takes the height the bar leaves, which is what bounds every
          page's scroll view. */}
      <View style={styles.stack}>
        {stack.map((route, index) => (
          <StackLayer key={routeKey(route)} covered={index < stack.length - 1}>
            {route.kind === "home" ? (
              <BrowseHome onOpenSection={openSection} />
            ) : route.kind === "section" ? (
              <SectionPage sectionKey={route.key} ctx={ctx} onBack={pop} />
            ) : (
              <PreviewPage previewKey={route.key} onClose={pop} />
            )}
          </StackLayer>
        ))}
      </View>

      {showBar ? (
        <ShowcaseNavBar
          title={title}
          onBack={canGoBack ? pop : undefined}
          colorScheme={colorScheme}
          onToggleTheme={onToggleTheme}
        />
      ) : null}
    </View>
  )
}

/**
 * The showcase's navigation, at the bottom of every page.
 *
 * One bar for the whole app rather than chrome per page: the back affordance,
 * the current section's title and the theme toggle sit in the same place on
 * every screen, so the chrome never moves as you navigate. It lives *outside*
 * the page stack, so pushing a section does not slide it — and so a covered
 * page can never own it.
 *
 * It is a `MobileNavBar` with its rule flipped. The wrapper owns the surface,
 * the top hairline and the bottom safe-area inset; the nav bar keeps owning the
 * 1/2/1 slot layout that actually centres the title.
 */
function ShowcaseNavBar({
  title,
  onBack,
  colorScheme,
  onToggleTheme,
}: {
  title: string
  onBack?: () => void
  colorScheme: "light" | "dark"
  onToggleTheme: () => void
}) {
  const { colors } = useMobileTheme()
  const goingDark = colorScheme === "light"

  return (
    <SafeAreaView
      edges={["bottom"]}
      testID="showcase-navbar"
      style={[
        styles.navBar,
        { backgroundColor: colors.card, borderTopColor: colors.border },
      ]}
    >
      <MobileNavBar
        bordered={false}
        style={styles.navBarInner}
        title={title}
        onBack={onBack}
        backAccessibilityLabel="Back to browse"
        right={
          <MobileButton
            variant="outline"
            size="sm"
            onPress={onToggleTheme}
            accessibilityLabel={
              goingDark ? "Switch to dark theme" : "Switch to light theme"
            }
          >
            {goingDark ? "🌙 Dark" : "☀️ Light"}
          </MobileButton>
        }
      />
    </SafeAreaView>
  )
}

/**
 * One mounted page in the stack.
 *
 * A covered layer keeps rendering — that is what preserves its scroll — but
 * its touches are disabled and it is hidden from screen readers, so only the
 * active page is interactive. New layers arrive on `SPRING_ENTRANCE`: a short
 * slide with a small overshoot, which reads as a push without pretending to be
 * a full navigation transition. Going back is deliberately instant — the page
 * underneath never unmounted, so there is nothing to animate back into place.
 */
function StackLayer({
  covered,
  children,
}: {
  covered: boolean
  children: React.ReactNode
}) {
  const enter = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    springTo(enter, 1, SPRING_ENTRANCE).start()
  }, [enter])

  return (
    <Animated.View
      // A stable hook for the screenshot harness: the active layer is the only
      // one that is not covered, and reaching it by walking up from a control
      // stops working once the bar lives outside the stack.
      testID={covered ? undefined : "showcase-layer-active"}
      pointerEvents={covered ? "none" : "auto"}
      accessibilityElementsHidden={covered}
      importantForAccessibility={covered ? "no-hide-descendants" : "yes"}
      style={[
        styles.layer,
        {
          opacity: enter,
          transform: [
            {
              translateX: enter.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

/**
 * The browse menu — the page the showcase opens on.
 *
 * One launcher card per section, in `SHOWCASE_SECTIONS` order, built from the
 * same launcher composition the Screens section teaches: a header-only card
 * wrapped in `MobilePressableScale`, one tap target, chevron on the right.
 *
 * It owns no chrome of its own — the theme toggle that used to sit in a bar
 * here is in the shared bottom bar now, so it is reachable from every page.
 */
function BrowseHome({
  onOpenSection,
}: {
  onOpenSection: (key: string) => void
}) {
  const { colors } = useMobileTheme()

  return (
    <SafeAreaView
      style={[styles.page, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          <View style={styles.header}>
            <MobileText variant="label" color="muted">
              CELESTIA STARTER
            </MobileText>
            <MobileText variant="display">Mobile UI</MobileText>
          </View>

          <MobileText variant="callout" color="muted">
            Every module in @celestia-project/mobile, grouped by role. Pick a
            section to browse its specimens; the Screens section opens each
            layout full-screen.
          </MobileText>

          {SHOWCASE_SECTIONS.map((section, index) => (
            <MobilePressableScale
              key={section.key}
              onPress={() => onOpenSection(section.key)}
              accessibilityLabel={`Open the ${section.title} section`}
              containerStyle={styles.launcher}
            >
              <MobileCard style={styles.launcherCard}>
                <MobileCardHeader>
                  <View style={styles.launcherRow}>
                    <MobileText
                      variant="caption"
                      color="muted"
                      tabular
                      style={styles.launcherIndex}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </MobileText>
                    <View style={styles.launcherText}>
                      <MobileCardTitle>{section.title}</MobileCardTitle>
                      <MobileCardDescription>
                        {section.summary}
                      </MobileCardDescription>
                    </View>
                    <MobileText variant="title" color="muted">
                      ›
                    </MobileText>
                  </View>
                </MobileCardHeader>
              </MobileCard>
            </MobilePressableScale>
          ))}

          <Spacer size={SPACE.section} />

          <MobileText variant="caption" color="muted" align="center">
            {`${SHOWCASE_SECTIONS.length} sections · @celestia-project/mobile`}
          </MobileText>
          <Spacer size={SPACE.block} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

/**
 * One section's specimens on their own page.
 *
 * The page owns no navigation: the section's title and the back affordance are
 * in the shared bottom bar, so a section opens straight onto its summary and
 * its first specimen. The body is the same section component the old
 * single-scroll gallery rendered, unchanged.
 */
function SectionPage({
  sectionKey,
  ctx,
  onBack,
}: {
  sectionKey: string
  ctx: ShowcaseContext
  onBack: () => void
}) {
  const { colors } = useMobileTheme()
  const section = SHOWCASE_SECTIONS.find((item) => item.key === sectionKey)

  // An unknown key pops instead of rendering a dead page — the same failure
  // philosophy as the preview registry's.
  React.useEffect(() => {
    if (!section) onBack()
  }, [section, onBack])

  if (!section) return null

  return (
    <SafeAreaView
      style={[styles.page, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          <MobileText
            variant="callout"
            color="muted"
            style={styles.sectionSummary}
          >
            {section.summary}
          </MobileText>
          <section.Component ctx={ctx} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

/**
 * A full-screen layout module, opened from the Screens section.
 *
 * The preview is its own stack layer — never inside a section page — because
 * the layout screens own their whole frame. Underneath it, the section page
 * stays mounted, so closing the preview returns to the exact place the tap
 * left it.
 */
function PreviewPage({
  previewKey,
  onClose,
}: {
  previewKey: string
  onClose: () => void
}) {
  const preview = findScreenPreview(previewKey)

  React.useEffect(() => {
    if (!preview) onClose()
  }, [preview, onClose])

  if (!preview) return null
  return <>{preview.render({ onClose })}</>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  /** The region the bottom bar leaves. Every page fills exactly this. */
  stack: {
    flex: 1,
  },
  /** Every page is an opaque absolute-fill box; later siblings draw on top. */
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  page: {
    flex: 1,
  },
  /** Takes the height the bottom bar leaves, which is what bounds the scroll. */
  scroll: {
    flex: 1,
  },
  /**
   * The column gutter is `SPACE.block` so the bleed specimens — which claw the
   * card's padding back — line up with it by construction rather than by a
   * hand-matched `-16`.
   */
  pageContent: {
    paddingHorizontal: SPACE.block,
    paddingTop: SPACE.row,
    paddingBottom: SPACE.label,
  },
  /** Centred and capped, so a wide viewport cannot stretch the specimens. */
  column: {
    width: "100%",
    maxWidth: COLUMN_MAX_WIDTH,
    alignSelf: "center",
  },
  header: {
    gap: 2,
    marginTop: SPACE.label,
    marginBottom: SPACE.row,
  },
  /** The launcher wrapper has to fill the column, not shrink-wrap the card. */
  launcher: {
    alignSelf: "stretch",
  },
  /**
   * Launcher cards own the page's rhythm the way specimens do: flat top,
   * block bottom, so the gap between cards never doubles.
   */
  launcherCard: {
    marginTop: 0,
    marginBottom: SPACE.block,
  },
  launcherRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.row,
  },
  launcherIndex: {
    width: 24,
    marginTop: 2,
  },
  launcherText: {
    flex: 1,
  },
  sectionSummary: {
    marginBottom: SPACE.row,
  },
  /** The rule spans the window; the bar's contents stay on the column. */
  navBar: {
    borderTopWidth: 1,
  },
  navBarInner: {
    width: "100%",
    maxWidth: COLUMN_MAX_WIDTH,
    alignSelf: "center",
    // The wrapper owns the surface; the nav bar must not paint its own.
    backgroundColor: "transparent",
  },
})
