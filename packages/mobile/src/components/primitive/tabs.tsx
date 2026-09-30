import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useMobileTheme } from "../../host"
import { springTo } from "../../motion"
import { metrics } from "../../tokens"
import { hapticSelect } from "../../utils"
import { MobileText } from "./text"

/**
 * Named `MobileTabsItem`, not `MobileTabItem` — that name already belongs to
 * the composite `MobileTabBar`'s item, and both ride the package root export.
 */
export interface MobileTabsItem {
  /** Stable identity reported through `onChange`. */
  key: string
  /** Visible tab caption. */
  label: string
}

export interface MobileTabsProps {
  /**
   * Tabs, rendered left to right.
   */
  tabs: MobileTabsItem[]
  /**
   * Key of the active tab. Controlled — the parent owns the state.
   */
  value: string
  /**
   * Called with the key of the tab the user tapped.
   */
  onChange: (key: string) => void
}

/** Indicator geometry: a 2pt underline inset from the tab edges. */
const INDICATOR_HEIGHT = 2
const INDICATOR_INSET = 10

/**
 * MobileTabs
 *
 * Content-less controlled tab strip — it renders the bar and the springing
 * underline only; screens own what appears below.
 *
 * Each tab reports its frame through `onLayout`, and the indicator chases the
 * active one with house springs. The bar itself is a 1pt-wide View scaled
 * horizontally (`scaleX`) rather than an animated `width`, because transform
 * runs on the native driver while layout props do not — and a solid-colour
 * bar scales without any visible distortion.
 */
export function MobileTabs({ tabs, value, onChange }: MobileTabsProps) {
  const { colors } = useMobileTheme()
  const [layouts, setLayouts] = React.useState<
    Record<string, { x: number; width: number }>
  >({})

  const translateX = React.useRef(new Animated.Value(0)).current
  const scaleX = React.useRef(new Animated.Value(0)).current

  const active = layouts[value]
  const activeX = active?.x
  const activeWidth = active?.width

  React.useEffect(() => {
    if (activeX == null || activeWidth == null) return
    const targetWidth = Math.max(0, activeWidth - INDICATOR_INSET * 2)
    // Centre-based transform: position the 1pt bar at the target's centre,
    // then stretch it to the target width.
    springTo(
      translateX,
      activeX + INDICATOR_INSET + targetWidth / 2 - 0.5
    ).start()
    springTo(scaleX, targetWidth).start()
  }, [activeX, activeWidth, translateX, scaleX])

  return (
    <View
      style={[styles.container, { borderBottomColor: colors.border }]}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const selected = tab.key === value
        return (
          <Pressable
            key={tab.key}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout
              setLayouts((current) => {
                const prev = current[tab.key]
                if (prev && prev.x === x && prev.width === width) return current
                return { ...current, [tab.key]: { x, width } }
              })
            }}
            onPress={() => {
              if (selected) return
              hapticSelect()
              onChange(tab.key)
            }}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            style={styles.tab}
          >
            <MobileText
              variant="callout"
              style={{
                color: selected ? colors.foreground : colors.muted,
                fontWeight: selected ? "600" : "500",
              }}
            >
              {tab.label}
            </MobileText>
          </Pressable>
        )
      })}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            backgroundColor: colors.primary,
            height: INDICATOR_HEIGHT,
            borderRadius: metrics.radius.full,
            // Hidden until the active tab has reported its frame.
            opacity: active ? 1 : 0,
            transform: [{ translateX }, { scaleX }],
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    minHeight: metrics.minTouchTarget,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 1,
  },
})
