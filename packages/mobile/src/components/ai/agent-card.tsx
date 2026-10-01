import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"
import { MobileText } from "../primitive/text"
import { MobilePressableScale } from "../primitive/pressable-scale"

export interface MobileAgentCardProps {
  /**
   * Agent name, e.g. "Research assistant".
   */
  name: string
  /**
   * One-line description of what the agent does.
   */
  description?: string
  /**
   * Avatar slot, typically `MobileAiAvatar`.
   */
  avatar?: React.ReactNode
  /**
   * Capability tags shown as a wrapping row, e.g. ["Web search", "Code"].
   */
  capabilities?: string[]
  /**
   * Trailing label, e.g. "Beta" or "2 tasks".
   */
  badge?: string
  /**
   * Selected state. Draws a primary ring.
   * @default false
   */
  selected?: boolean
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Fires on commit. Omit to render a static card.
   */
  onPress?: () => void
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
 * MobileAgentCard
 *
 * One selectable agent or persona in a picker.
 *
 * Capabilities are rendered as a wrapping tag row rather than as prose, because
 * the question a user is answering here is "can this thing do the job I have in
 * mind" — and that is a scan for a keyword, not a paragraph to read. The
 * selected state is a **ring plus a glyph-free border weight change**, not a
 * fill: a filled card would fight the avatar inside it for attention.
 */
export function MobileAgentCard({
  name,
  description,
  avatar,
  capabilities,
  badge,
  selected = false,
  disabled = false,
  onPress,
  style,
  testID,
}: MobileAgentCardProps) {
  const { colors } = useMobileTheme()

  const content = (
    <>
      <View style={styles.header}>
        {avatar ? <View style={styles.avatar}>{avatar}</View> : null}

        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <MobileText variant="callout" numberOfLines={1} style={styles.name}>
              {name}
            </MobileText>
            {badge ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.mutedBackground,
                    borderRadius: metrics.radius.full,
                  },
                ]}
              >
                <MobileText variant="label" color="muted">
                  {badge}
                </MobileText>
              </View>
            ) : null}
          </View>
          {description ? (
            <MobileText variant="caption" color="muted" numberOfLines={2}>
              {description}
            </MobileText>
          ) : null}
        </View>
      </View>

      {capabilities && capabilities.length > 0 ? (
        <View style={styles.tags}>
          {capabilities.map((capability) => (
            <View
              key={capability}
              style={[
                styles.tag,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                  borderRadius: metrics.radius.sm,
                },
              ]}
            >
              <MobileText variant="caption" color="muted">
                {capability}
              </MobileText>
            </View>
          ))}
        </View>
      ) : null}
    </>
  )

  // A single flattened object, not an array: `MobilePressableScale.style` is
  // typed `ViewStyle`, and an array would not be assignable to it.
  const cardStyle: ViewStyle = {
    ...styles.card,
    backgroundColor: colors.card,
    borderRadius: metrics.radius.md,
    borderColor: selected ? colors.primary : colors.cardBorder,
    borderWidth: selected ? 2 : 1,
    opacity: disabled ? 0.5 : 1,
    ...style,
  }

  if (!onPress) {
    return (
      <View testID={testID} style={cardStyle}>
        {content}
      </View>
    )
  }

  return (
    <MobilePressableScale
      onPress={() => {
        hapticLight()
        onPress()
      }}
      disabled={disabled}
      accessibilityLabel={`${name}${description ? `, ${description}` : ""}`}
      containerStyle={styles.wrapper}
      style={cardStyle}
    >
      {content}
    </MobilePressableScale>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
  },
  card: {
    gap: 10,
    padding: 12,
    minHeight: metrics.minTouchTarget,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avatar: {
    marginTop: 1,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontWeight: "600",
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
})
