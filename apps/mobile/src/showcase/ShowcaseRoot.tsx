import * as React from "react"
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { MobileButton, MobileText, useMobileTheme } from "@celestia-project/mobile"
import {
  ActiveSectionProvider,
  SectionKeyProvider,
  ShowcaseNavProvider,
  ShowcaseNavSheet,
  type ShowcaseNavEntry,
  type ShowcaseNavValue,
} from "./nav"
import { findScreenPreview } from "./screens-preview"
import { SHOWCASE_SECTIONS } from "./sections"
import type { ShowcaseContext } from "./types"
import { ShowcaseSectionHeader, Spacer } from "./ui"

/**
 * The showcase shell.
 *
 * It owns the three pieces of state the gallery needs — the active colour scheme
 * (lifted to `App.tsx` so it can be forced onto `MobileHost`), the currently open
 * screen preview, and the jump menu — and nothing else.
 *
 * The preview is rendered **instead of** the gallery, never on top of it. The
 * layout screens provide their own safe-area padding and their own scroll view,
 * so mounting one inside the gallery's `SafeAreaView` would inset it twice and
 * make every screen look subtly wrong in a way that is easy to blame on the
 * component.
 *
 * Navigation is *measured*, not hardcoded — see `nav.tsx` for why.
 */

/** How far above a target the scroll settles, so a heading is never flush to the edge. */
const JUMP_INSET = 8

/** How far a section must reach the top before the menu calls it current. */
const ACTIVE_THRESHOLD = 72

/** The section the gallery opens on, and the fallback when nothing else matches. */
const FIRST_SECTION_KEY = SHOWCASE_SECTIONS[0]?.key ?? ""

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

  // ---------------------------------------------------------------------------
  // Jump menu
  // ---------------------------------------------------------------------------

  const scrollRef = React.useRef<ScrollView>(null)
  /** The single child of the `ScrollView`; anchors are measured against it. */
  const contentRef = React.useRef<View>(null)
  const anchors = React.useRef(new Map<string, View | null>())
  const sectionOffsets = React.useRef(new Map<string, number>())
  /** Declaration order, which is gallery order — the menu renders it as-is. */
  const declared = React.useRef<ShowcaseNavEntry[]>([])

  const [menuOpen, setMenuOpen] = React.useState(false)
  const [menuEntries, setMenuEntries] = React.useState<ShowcaseNavEntry[]>([])
  const [activeSection, setActiveSection] = React.useState(FIRST_SECTION_KEY)

  const attachAnchor = React.useCallback((key: string, node: View | null) => {
    if (node) anchors.current.set(key, node)
    else anchors.current.delete(key)
  }, [])

  const declareEntry = React.useCallback((entry: ShowcaseNavEntry) => {
    const list = declared.current
    if (list.some((existing) => existing.key === entry.key)) return
    list.push(entry)
  }, [])

  const reportSectionOffset = React.useCallback((key: string, y: number) => {
    sectionOffsets.current.set(key, y)
  }, [])

  /**
   * Scrolls so `key` sits `JUMP_INSET` below the top of the viewport.
   *
   * Both nodes are measured in **window** coordinates, so their difference is the
   * anchor's offset within the scroll content regardless of how far the gallery is
   * scrolled when the menu is used. Summing `onLayout` offsets would instead
   * require knowing every level of nesting between the anchor and the content.
   */
  const jumpTo = React.useCallback((key: string) => {
    const anchor = anchors.current.get(key)
    const content = contentRef.current
    const scroller = scrollRef.current
    if (!anchor || !content || !scroller) return

    anchor.measureInWindow((_ax, anchorY) => {
      content.measureInWindow((_cx, contentY) => {
        scroller.scrollTo({
          y: Math.max(0, anchorY - contentY - JUMP_INSET),
          animated: true,
        })
      })
    })
  }, [])

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y
      let current = FIRST_SECTION_KEY

      for (const section of SHOWCASE_SECTIONS) {
        const offset = sectionOffsets.current.get(section.key)
        if (offset !== undefined && y >= offset - ACTIVE_THRESHOLD) {
          current = section.key
        }
      }

      setActiveSection((previous) => (previous === current ? previous : current))
    },
    []
  )

  const openMenu = React.useCallback(() => {
    // Snapshot on open. The gallery is a plain `ScrollView`, so every section and
    // specimen has already mounted and declared itself by the time this runs.
    setMenuEntries([...declared.current])
    setMenuOpen(true)
  }, [])

  const closeMenu = React.useCallback(() => setMenuOpen(false), [])

  const handleSelect = React.useCallback(
    (key: string) => {
      setMenuOpen(false)
      jumpTo(key)
    },
    [jumpTo]
  )

  const nav = React.useMemo<ShowcaseNavValue>(
    () => ({ attachAnchor, declareEntry, reportSectionOffset, jumpTo }),
    [attachAnchor, declareEntry, reportSectionOffset, jumpTo]
  )

  // Stable ref callbacks, so a re-render never detaches and reattaches an anchor.
  const sectionRefs = React.useMemo(() => {
    const make = (key: string) => (node: View | null) => {
      if (node) anchors.current.set(key, node)
      else anchors.current.delete(key)
    }
    return new Map(SHOWCASE_SECTIONS.map((section) => [section.key, make(section.key)]))
  }, [])

  const handleSectionLayout = React.useCallback(
    (key: string) => (event: LayoutChangeEvent) => {
      reportSectionOffset(key, event.nativeEvent.layout.y)
    },
    [reportSectionOffset]
  )

  // Sections come from the static table, so they can be declared in one pass
  // instead of each one announcing itself. Declaring them before any specimen
  // also fixes the group order in the menu, which is otherwise first-declared-first.
  React.useEffect(() => {
    for (const section of SHOWCASE_SECTIONS) {
      declareEntry({
        key: section.key,
        title: section.title,
        sectionKey: section.key,
        kind: "section",
      })
    }
  }, [declareEntry])

  if (preview) {
    return (
      <>
        <StatusBar style={statusBarStyle} />
        {preview.render({ onClose: closePreview })}
      </>
    )
  }

  return (
    <ShowcaseNavProvider value={nav}>
      <ActiveSectionProvider value={activeSection}>
        <SafeAreaView
          style={[styles.gallery, { backgroundColor: colors.background }]}
          edges={["top", "bottom"]}
        >
          <StatusBar style={statusBarStyle} />

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.galleryContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            // Without this, the first tap after focusing a field only dismisses the
            // keyboard and the user has to tap a second time to hit the control.
            keyboardShouldPersistTaps="handled"
          >
            <View ref={contentRef}>
              <View style={styles.header}>
                <MobileText variant="label" color="muted">
                  CELESTIA STARTER
                </MobileText>
                <MobileText variant="display">Mobile UI</MobileText>
              </View>

              <MobileText variant="callout" color="muted">
                Every module in @celestia-project/mobile, grouped by role. Use the
                bar at the bottom of the screen to jump straight to a section or a
                component; tap any screen in the last section to open it
                full-screen.
              </MobileText>

              {SHOWCASE_SECTIONS.map((section, index) => (
                <SectionKeyProvider key={section.key} value={section.key}>
                  <View
                    ref={sectionRefs.get(section.key)}
                    onLayout={handleSectionLayout(section.key)}
                  >
                    <ShowcaseSectionHeader
                      index={index + 1}
                      title={section.title}
                      summary={section.summary}
                    />
                    <section.Component ctx={ctx} />
                  </View>
                </SectionKeyProvider>
              ))}

              <Spacer size={40} />

              <MobileText variant="caption" color="muted" align="center">
                {`${SHOWCASE_SECTIONS.length} sections · 44 modules · 145 exports`}
              </MobileText>
              <Spacer size={16} />
            </View>
          </ScrollView>

          {/* Sticky by construction: the bar is a sibling of the `ScrollView` in
              normal flow, so it never scrolls and the scroll view simply gets
              whatever height is left. No `position: absolute`, no overlay, and
              nothing to keep in sync when the content grows. */}
          <View
            style={[
              styles.bottomBar,
              { borderTopColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <MobileButton
              variant="outline"
              containerStyle={styles.barButton}
              onPress={openMenu}
              testID="showcase-nav-button"
            >
              Browse
            </MobileButton>
            <MobileButton
              variant="outline"
              containerStyle={styles.barButton}
              onPress={onToggleTheme}
            >
              {colorScheme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </MobileButton>
          </View>
        </SafeAreaView>

        <ShowcaseNavSheet
          isPresented={menuOpen}
          onDismiss={closeMenu}
          entries={menuEntries}
          onSelect={handleSelect}
        />
      </ActiveSectionProvider>
    </ShowcaseNavProvider>
  )
}

const styles = StyleSheet.create({
  gallery: {
    flex: 1,
  },
  /** Takes the height the bottom bar leaves, which is what bounds the scroll. */
  scroll: {
    flex: 1,
  },
  galleryContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    gap: 2,
    marginTop: 8,
    marginBottom: 10,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  /** Both controls share the width evenly, so neither reads as the afterthought. */
  barButton: {
    flex: 1,
  },
})
