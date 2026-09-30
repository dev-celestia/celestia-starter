import * as React from "react"
import {
  Animated,
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { springTo, usePressSpring } from "../../motion"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

export interface MobileTabItem {
  /**
   * Stable identity for this tab. Selection is keyed on this, never the index.
   */
  key: string
  /**
   * Tab caption.
   */
  label: string
  /**
   * Icon node. Icons arrive as props — the package ships no icon dependency.
   */
  icon?: React.ReactNode
  /**
   * Optional count or short status shown on the icon.
   */
  badge?: string | number
  /**
   * Disables this tab only.
   */
  disabled?: boolean
}

export interface MobileTabBarProps {
  /**
   * Tabs, rendered left to right at equal widths.
   */
  items: MobileTabItem[]
  /**
   * `key` of the selected tab.
   */
  activeKey: string
  /**
   * Called with the pressed tab's key.
   */
  onTabPress: (key: string) => void
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * One tab: an equal-width `Pressable` with a press bounce (scale 0.92 → 1 on
 * release) and an icon pop whenever it becomes the selected tab. Extracted to
 * module scope so each tab owns its own `Animated.Value`s across renders.
 */
function TabItem({
  item,
  isActive,
  tint,
  badgeColor,
  badgeForeground,
  onPress,
}: {
  item: MobileTabItem
  isActive: boolean
  tint: string
  badgeColor: string
  badgeForeground: string
  onPress: () => void
}) {
  // Press feedback: dip to 0.92 on a short timing, spring back on release.
  // The old handlers' item.disabled guards were redundant — the Pressable
  // below is disabled on the same condition, so it never fires these events.
  const { value: pressScale, onPressIn, onPressOut } = usePressSpring(1, 0.92)
  const iconScale = React.useRef(new Animated.Value(1)).current

  // Pop the icon each time the tab becomes selected; inactive tabs rest at 1.
  React.useEffect(() => {
    if (!isActive) {
      iconScale.setValue(1)
      return
    }
    iconScale.setValue(0.8)
    springTo(iconScale, 1).start()
  }, [isActive, iconScale])

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={item.disabled === true}
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{
        selected: isActive,
        disabled: item.disabled === true,
      }}
      style={[styles.tab, { opacity: item.disabled ? 0.45 : 1 }]}
    >
      <Animated.View
        style={[styles.tabInner, { transform: [{ scale: pressScale }] }]}
      >
        <Animated.View
          style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}
        >
          {item.icon}
          {item.badge !== undefined ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: badgeColor },
              ]}
            >
              <MobileText
                variant="label"
                tabular
                style={[
                  styles.badgeText,
                  { color: badgeForeground },
                ]}
              >
                {String(item.badge)}
              </MobileText>
            </View>
          ) : null}
        </Animated.View>

        <MobileText
          variant="caption"
          numberOfLines={1}
          style={{
            color: tint,
            fontWeight: isActive ? "600" : "400",
          }}
        >
          {item.label}
        </MobileText>
      </Animated.View>
    </Pressable>
  )
}

/**
 * MobileTabBar
 *
 * Bottom navigation. Each tab is an equal-width `Pressable` with
 * `accessibilityRole="tab"`, so assistive tech announces the set and the
 * current selection.
 *
 * Selection is keyed on a **required** `key` rather than the index — an index
 * would silently point at the wrong tab the moment the list is reordered or
 * filtered.
 *
 * The bar owns presentation only: it reports presses and never routes. The host
 * app decides what a tab means.
 */
export function MobileTabBar({
  items,
  activeKey,
  onTabPress,
  style,
  testID,
}: MobileTabBarProps) {
  const { colors } = useMobileTheme()

  const handlePress = (item: MobileTabItem) => {
    if (item.disabled || item.key === activeKey) return
    Haptics.selectionAsync().catch(() => {})
    onTabPress(item.key)
  }

  return (
    <View
      accessibilityRole="tablist"
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        style,
      ]}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey

        return (
          <TabItem
            key={item.key}
            item={item}
            isActive={isActive}
            tint={isActive ? colors.primary : colors.muted}
            badgeColor={colors.destructive}
            badgeForeground={colors.destructiveForeground}
            onPress={() => handlePress(item)}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    minHeight: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
})
