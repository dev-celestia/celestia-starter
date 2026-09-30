import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useMobileTheme } from "../../host"
import { useToggle } from "../../hooks"
import { springTo } from "../../motion"
import { metrics } from "../../tokens"
import { hapticSelect } from "../../utils"
import { MobileText } from "./text"

export interface MobileMenuItem {
  /** Row caption. */
  label: string
  /** Fired after the selection tick and after the panel closes. */
  onPress: () => void
  /** Renders the row in the destructive colour. */
  destructive?: boolean
  /** Greys the row out and ignores taps. */
  disabled?: boolean
}

export interface MobileMenuProps {
  /**
   * Menu entries, top to bottom.
   */
  items: MobileMenuItem[]
  /**
   * Element that toggles the panel. Defaults to an overflow (⋯) glyph so a
   * bare menu is still usable.
   */
  trigger?: React.ReactNode
  /**
   * Which edge of the trigger the panel aligns to.
   * @default 'left'
   */
  align?: "left" | "right"
}

/**
 * MobileMenu
 *
 * Pressable trigger + absolutely-positioned dropdown panel (surface fill,
 * 1pt border, card radius). Tapping the trigger again closes the panel —
 * there is no outside-press dismissal, by design: an invisible full-screen
 * responder would swallow taps on whatever sits behind the menu.
 *
 * Item presses fire `hapticSelect` *before* the callback so the tick lands on
 * the causal commit frame, then close the panel. The panel springs in
 * (opacity + a few points of translateY) whenever it mounts open.
 */
export function MobileMenu({ items, trigger, align = "left" }: MobileMenuProps) {
  const { colors } = useMobileTheme()
  const [open, toggleOpen, setOpen] = useToggle(false)
  const [triggerWidth, setTriggerWidth] = React.useState(0)
  const panelAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (!open) {
      panelAnim.setValue(0)
      return
    }
    springTo(panelAnim, 1).start()
  }, [open, panelAnim])

  const handleItemPress = (item: MobileMenuItem) => {
    if (item.disabled) return
    hapticSelect()
    setOpen(false)
    item.onPress()
  }

  return (
    <View style={styles.root}>
      <Pressable
        onPress={toggleOpen}
        onLayout={(event) => setTriggerWidth(event.nativeEvent.layout.width)}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        accessibilityState={{ expanded: open }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {trigger ?? (
          <View
            style={[
              styles.defaultTrigger,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <MobileText variant="callout" style={{ color: colors.foreground }}>
              ⋯
            </MobileText>
          </View>
        )}
      </Pressable>

      {open ? (
        <Animated.View
          style={[
            styles.panel,
            align === "right" ? styles.panelRight : styles.panelLeft,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              // Never narrower than the trigger, so the panel reads as
              // attached to it.
              minWidth: triggerWidth || undefined,
              opacity: panelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
              transform: [
                {
                  translateY: panelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-4, 0],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          {items.map((item) => {
            const labelColor = item.disabled
              ? colors.muted
              : item.destructive
                ? colors.destructive
                : colors.foreground
            return (
              <Pressable
                key={item.label}
                onPress={() => handleItemPress(item)}
                disabled={item.disabled}
                accessibilityRole="menuitem"
                accessibilityLabel={item.label}
                accessibilityState={{ disabled: Boolean(item.disabled) }}
                style={({ pressed }) => [
                  styles.item,
                  // A press tint needs no animation value — it is transient
                  // and released with the touch.
                  pressed && !item.disabled
                    ? { backgroundColor: colors.mutedBackground }
                    : null,
                  item.disabled ? styles.itemDisabled : null,
                ]}
              >
                <MobileText variant="callout" style={{ color: labelColor }}>
                  {item.label}
                </MobileText>
              </Pressable>
            )
          })}
        </Animated.View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "flex-start",
  },
  defaultTrigger: {
    minWidth: metrics.minTouchTarget,
    minHeight: 32,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: metrics.radius.sm,
    borderWidth: 1,
  },
  panel: {
    position: "absolute",
    top: "100%",
    marginTop: 4,
    borderRadius: metrics.radius.md,
    borderWidth: 1,
    paddingVertical: 4,
    // Above sibling content on both platforms.
    zIndex: 20,
    elevation: 6,
  },
  panelLeft: {
    left: 0,
  },
  panelRight: {
    right: 0,
  },
  item: {
    minHeight: metrics.minTouchTarget,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  itemDisabled: {
    opacity: 0.5,
  },
})
