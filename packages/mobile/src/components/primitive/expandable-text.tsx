import * as React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { hapticSelect, hitSlopFor } from "../../utils"
import { MobileText } from "./text"

export interface MobileExpandableTextProps {
  /**
   * Full text. Collapsed, it is clamped to `lines`; expanded, all of it
   * renders.
   */
  text: string
  /**
   * Number of lines shown while collapsed.
   * @default 3
   */
  lines?: number
}

/**
 * MobileExpandableText
 *
 * Clamped paragraph with a More/Less toggle. The toggle only appears when the
 * text actually overflows: `onTextLayout` reports the laid-out line count, so
 * a two-line body in a three-line clamp never shows a pointless "More".
 *
 * The affordance is a text link rather than a chevron because the state it
 * communicates is textual ("there is more to read") — a selection tick fires
 * on toggle.
 */
export function MobileExpandableText({
  text,
  lines = 3,
}: MobileExpandableTextProps) {
  const { colors } = useMobileTheme()
  const [expanded, setExpanded] = React.useState(false)
  const [overflows, setOverflows] = React.useState(false)

  const toggle = () => {
    hapticSelect()
    setExpanded((current) => !current)
  }

  return (
    <View>
      <MobileText
        variant="body"
        numberOfLines={expanded ? undefined : lines}
        onTextLayout={(event) => {
          // While expanded this counts the *full* layout, which still
          // overflows `lines` whenever the toggle should stay available.
          setOverflows(event.nativeEvent.lines.length > lines)
        }}
      >
        {text}
      </MobileText>

      {overflows ? (
        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Show less" : "Show more"}
          accessibilityState={{ expanded }}
          hitSlop={hitSlopFor(20)}
          style={styles.toggle}
        >
          <MobileText variant="callout" style={{ color: colors.primary, fontWeight: "600" }}>
            {expanded ? "Less" : "More"}
          </MobileText>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  toggle: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 2,
  },
})
