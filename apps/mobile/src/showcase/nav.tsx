import * as React from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import {
  MobileBottomSheet,
  MobileText,
  metrics,
  useMobileTheme,
} from "@celestia-project/mobile"

/**
 * The showcase's navigation seam.
 *
 * The gallery is one long `ScrollView` of seven sections and thirty-one
 * specimens, which is fine to read top-to-bottom and miserable to *search*. This
 * module is the jump menu that fixes that.
 *
 * Three rules shape it:
 *
 * 1. **Nothing here knows the section list.** Entries are *declared* by whatever
 *    renders them — a section wrapper declares itself, a `Specimen` declares
 *    itself — so adding a section or a specimen needs no edit here, and the menu
 *    can never disagree with the gallery. The `SHOWCASE_SECTIONS` array stays the
 *    single source of truth for order and copy; this only mirrors it.
 * 2. **Offsets are measured, never accumulated.** A specimen's position depends on
 *    every spacer and heading above it, so the menu resolves a target by
 *    measuring the anchor and the scroll content in the same coordinate space at
 *    tap time. Summing `onLayout` offsets up a nesting chain would break the first
 *    time somebody wrapped a section in another `View`.
 * 3. **Scroll-spy uses section offsets only.** Sections *are* direct children of
 *    the scroll content, so their `onLayout` y is already the absolute content
 *    offset. Specimens are not, so they are measured on demand instead of tracked
 *    continuously — measuring thirty-one nodes on every scroll frame would be
 *    wasteful and buys nothing, since only the section highlight is visible.
 */

/** One jump target: a section, or a specimen inside one. */
export interface ShowcaseNavEntry {
  /** Stable identity, and the anchor key used by `jumpTo`. */
  key: string
  /** Menu caption. */
  title: string
  /** The section this belongs to — a section's own key when `kind` is `"section"`. */
  sectionKey: string
  kind: "section" | "specimen"
}

export interface ShowcaseNavValue {
  /** Registers a node so `jumpTo` can measure it. Pass `null` on unmount. */
  attachAnchor: (key: string, node: View | null) => void
  /** Adds an entry to the menu. Idempotent — safe under StrictMode double-render. */
  declareEntry: (entry: ShowcaseNavEntry) => void
  /** Reports a section's absolute content offset, for scroll-spy. */
  reportSectionOffset: (key: string, y: number) => void
  /** Scrolls the gallery so `key` sits at the top of the viewport. */
  jumpTo: (key: string) => void
}

const ShowcaseNavContext = React.createContext<ShowcaseNavValue | null>(null)

/**
 * The navigator, or `null` outside a provider.
 *
 * Deliberately nullable rather than throwing: `Specimen` is used by all seven
 * section files, and a section rendered outside the gallery — a screen preview,
 * a future isolated story — should degrade to "no jump menu", not crash.
 */
export function useShowcaseNav(): ShowcaseNavValue | null {
  return React.useContext(ShowcaseNavContext)
}

export const ShowcaseNavProvider = ShowcaseNavContext.Provider

/**
 * The section currently at the top of the viewport.
 *
 * Kept in its own context on purpose. It changes on almost every scroll frame, so
 * folding it into `ShowcaseNavValue` would re-render all thirty-one specimens each
 * time the gallery crossed a heading. Only the sheet reads it.
 */
const ActiveSectionContext = React.createContext("")

export function useActiveSection(): string {
  return React.useContext(ActiveSectionContext)
}

export const ActiveSectionProvider = ActiveSectionContext.Provider

/**
 * The key of the section currently being rendered.
 *
 * Lets a `Specimen` file itself under the right heading without every section
 * having to thread its own key down through props.
 */
const SectionKeyContext = React.createContext<string>("")

export function useSectionKey(): string {
  return React.useContext(SectionKeyContext)
}

export const SectionKeyProvider = SectionKeyContext.Provider

export interface ShowcaseNavSheetProps {
  isPresented: boolean
  onDismiss: () => void
  /** Entries in declaration order, i.e. gallery order. */
  entries: ShowcaseNavEntry[]
  onSelect: (key: string) => void
}

/**
 * The jump menu.
 *
 * Grouped by section, with the components nested under their own heading, so the
 * shape of the menu is the shape of the page. `half` and `full` snap points are
 * both offered because seven sections plus thirty-one components do not fit on
 * one screen, but the section list alone very nearly does.
 *
 * The active section is read from context rather than passed down, so the sheet
 * can sit inside the provider that the gallery also renders into.
 */
export function ShowcaseNavSheet({
  isPresented,
  onDismiss,
  entries,
  onSelect,
}: ShowcaseNavSheetProps) {
  const { colors } = useMobileTheme()
  const activeSection = useActiveSection()

  const groups = React.useMemo(() => {
    const bySection = new Map<string, ShowcaseNavEntry[]>()
    for (const entry of entries) {
      const bucket = bySection.get(entry.sectionKey)
      if (bucket) bucket.push(entry)
      else bySection.set(entry.sectionKey, [entry])
    }
    return [...bySection.entries()].map(([sectionKey, items]) => ({
      sectionKey,
      section: items.find((item) => item.kind === "section"),
      specimens: items.filter((item) => item.kind === "specimen"),
    }))
  }, [entries])

  return (
    <MobileBottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      snapPoints={["half", "full"]}
      testID="showcase-nav-sheet"
    >
      <MobileText variant="title">Jump to</MobileText>
      <MobileText variant="caption" color="muted" style={styles.hint}>
        Seven sections, and every component inside them.
      </MobileText>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {groups.map((group, index) => {
          const isActive = group.sectionKey === activeSection

          return (
            <View key={group.sectionKey} style={styles.group}>
              <Pressable
                onPress={() => onSelect(group.sectionKey)}
                accessibilityRole="button"
                accessibilityLabel={`Jump to ${group.section?.title ?? group.sectionKey}`}
                style={[
                  styles.row,
                  styles.sectionRow,
                  { borderColor: colors.border },
                ]}
              >
                <MobileText
                  variant="caption"
                  color={isActive ? "primary" : "muted"}
                  tabular
                  style={styles.index}
                >
                  {String(index + 1).padStart(2, "0")}
                </MobileText>
                <MobileText
                  variant="bodyMedium"
                  color={isActive ? "primary" : "foreground"}
                  style={styles.rowLabel}
                >
                  {group.section?.title ?? group.sectionKey}
                </MobileText>
                {isActive ? (
                  <MobileText variant="caption" color="primary">
                    ●
                  </MobileText>
                ) : null}
              </Pressable>

              {group.specimens.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => onSelect(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Jump to ${item.title}`}
                  style={styles.row}
                >
                  <View
                    style={[styles.rule, { backgroundColor: colors.border }]}
                  />
                  <MobileText
                    variant="callout"
                    color="muted"
                    style={styles.rowLabel}
                  >
                    {item.title}
                  </MobileText>
                </Pressable>
              ))}
            </View>
          )
        })}
      </ScrollView>
    </MobileBottomSheet>
  )
}

const styles = StyleSheet.create({
  hint: {
    marginTop: 2,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  group: {
    marginBottom: 10,
  },
  row: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionRow: {
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  index: {
    width: 24,
  },
  rowLabel: {
    flex: 1,
    fontWeight: "600",
  },
  /** The indent guide that makes nesting legible without an icon set. */
  rule: {
    width: 1,
    height: 16,
    marginLeft: 11,
    marginRight: 12,
  },
})
