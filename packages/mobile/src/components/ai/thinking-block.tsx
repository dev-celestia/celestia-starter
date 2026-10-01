import * as React from "react"
import {
  Pressable,
  StyleSheet,
  View,
  Animated,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { canUseNativeDriver } from "../../motion"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor, isTextChildren } from "../../utils"
import { MobileText } from "../primitive/text"
import { MobileCollapsible } from "../primitive/collapsible"

export interface MobileThinkingBlockProps {
  /**
   * Reasoning trace. Plain text is wrapped automatically; a node replaces it.
   */
  children?: React.ReactNode
  /**
   * Short label for the header.
   * @default 'Thinking'
   */
  label?: string
  /**
   * Elapsed time caption, e.g. "4.2s". Rendered after the label.
   */
  duration?: string
  /**
   * Controlled open state. When omitted the block manages its own state and
   * starts collapsed.
   */
  open?: boolean
  /**
   * Initial state for the uncontrolled case.
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Renders the trace in the muted, indented "internal" style.
   * @default true
   */
  muted?: boolean
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const HEADER_HEIGHT = 36

/**
 * MobileThinkingBlock
 *
 * Collapsible reasoning trace — the "Thought for 4.2s" disclosure that keeps a
 * model's scratchpad out of the way until it is asked for.
 *
 * Collapsed by default and *uncontrolled* when `open` is omitted, so the common
 * case needs no state in the caller. The header is a 36pt row lifted to the
 * 44pt touch target with `hitSlop` rather than by inflating the box, matching
 * `MobileButton`.
 *
 * A reasoning trace is a disclosure, not a message: it renders muted and
 * indented so the eye can skip it while still finding it when needed.
 */
export function MobileThinkingBlock({
  children,
  label = "Thinking",
  duration,
  open,
  defaultOpen = false,
  muted = true,
  style,
  testID,
}: MobileThinkingBlockProps) {
  const { colors } = useMobileTheme()
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const expanded = isControlled ? open : internalOpen

  const chevron = React.useRef(new Animated.Value(defaultOpen ? 1 : 0)).current

  React.useEffect(() => {
    Animated.timing(chevron, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: canUseNativeDriver,
    }).start()
  }, [expanded, chevron])

  const handlePress = () => {
    hapticLight()
    if (!isControlled) setInternalOpen((value) => !value)
  }

  const slop = hitSlopFor(HEADER_HEIGHT)

  return (
    <View
      testID={testID}
      style={[
        styles.block,
        {
          backgroundColor: colors.mutedBackground,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.md,
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${label}${duration ? `, ${duration}` : ""}`}
        accessibilityState={{ expanded }}
        hitSlop={{ top: slop, bottom: slop }}
        style={styles.header}
      >
        <View
          style={[
            styles.glyphBox,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderRadius: metrics.radius.sm,
            },
          ]}
        >
          <MobileText variant="caption" color="muted">
            {"\u2726"}
          </MobileText>
        </View>

        <MobileText
          variant="callout"
          color="muted"
          style={styles.headerLabel}
          numberOfLines={1}
        >
          {label}
        </MobileText>

        {duration ? (
          <MobileText variant="caption" color="muted" tabular>
            {duration}
          </MobileText>
        ) : null}

        <Animated.View
          style={{
            transform: [
              {
                rotate: chevron.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "90deg"],
                }),
              },
            ],
          }}
        >
          <MobileText variant="caption" color="muted">
            {"\u203A"}
          </MobileText>
        </Animated.View>
      </Pressable>

      <MobileCollapsible open={expanded}>
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {children != null ? (
            isTextChildren(children) ? (
              <MobileText
                variant="caption"
                color={muted ? "muted" : "foreground"}
                style={styles.bodyText}
              >
                {children}
              </MobileText>
            ) : (
              children
            )
          ) : null}
        </View>
      </MobileCollapsible>
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    minHeight: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  glyphBox: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerLabel: {
    flex: 1,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bodyText: {
    lineHeight: 18,
  },
})
