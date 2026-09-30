import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { useSpringValue } from "../../motion"
import { MobileText } from "../primitive/text"
import { MobileCollapsible } from "../primitive/collapsible"
import { metrics } from "../../tokens"
import { hapticSelect } from "../../utils"
import { useToggle } from "../../hooks"

export interface MobileFaqItemProps {
  /**
   * Question shown in the always-visible header row.
   */
  question: string
  /**
   * Answer revealed on expand. A node, not a string, so answers can carry
   * links and lists.
   */
  answer: React.ReactNode
  /**
   * Optional style override for the container.
   */
  style?: ViewStyle
}

/**
 * MobileFaqItem
 *
 * Single-question disclosure: header row + collapsible answer, with a
 * chevron that rotates 90° as it opens. Built on `MobileCollapsible` rather
 * than `MobileAccordion` because the chevron rotation has to be driven by
 * this component's own open state.
 */
export function MobileFaqItem({ question, answer, style }: MobileFaqItemProps) {
  const { colors } = useMobileTheme()
  const [open, toggle] = useToggle(false)

  // Single 0→1 value drives the chevron rotation; transform only, so the
  // native driver can own it.
  const openAnim = useSpringValue(open ? 1 : 0)

  const rotate = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  })

  const handleToggle = () => {
    hapticSelect()
    toggle()
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
        style,
      ]}
    >
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={question}
        style={styles.header}
      >
        <MobileText variant="bodyMedium" style={styles.question}>
          {question}
        </MobileText>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MobileText variant="bodyMedium" color="muted" style={styles.chevron}>
            ›
          </MobileText>
        </Animated.View>
      </Pressable>

      <MobileCollapsible open={open}>
        <View style={styles.answer}>{answer}</View>
      </MobileCollapsible>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  question: {
    flex: 1,
  },
  chevron: {
    fontWeight: "600",
  },
  answer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
})
