import * as React from "react"
import { View, StyleSheet, type ImageSourcePropType, type ViewStyle } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileAvatar } from "../primitive/avatar"
import { MobileStack } from "../primitive/stack"
import { getInitials } from "../../utils"

export interface MobileProfileHeaderProps {
  /**
   * Display name, rendered as the heading.
   */
  name: string
  /**
   * @handle rendered muted under the name.
   */
  handle?: string
  /**
   * Explicit initials for the avatar. Derived from `name` via `getInitials`
   * when omitted.
   */
  initials?: string
  /**
   * Avatar photo; wins over initials.
   */
  imageSource?: ImageSourcePropType
  /**
   * Compact stats (posts, followers…) rendered as a row of tabular value +
   * muted label pairs.
   */
  stats?: { label: string; value: string }[]
  /**
   * Slot under the identity block, typically action buttons.
   */
  children?: React.ReactNode
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
 * MobileProfileHeader
 *
 * XL avatar, name heading, muted handle, stats row, and an actions slot — the
 * top of every profile screen.
 *
 * Stats values are tabular so follower counts do not jiggle when they tick
 * upward. The component owns layout only; follow/edit buttons belong in
 * `children` because their behaviour is the screen's, not the header's.
 */
export function MobileProfileHeader({
  name,
  handle,
  initials,
  imageSource,
  stats,
  children,
  style,
  testID,
}: MobileProfileHeaderProps) {
  const resolvedInitials = initials ?? (name ? getInitials(name) : undefined)

  return (
    <View testID={testID} style={[styles.container, style]}>
      <MobileAvatar
        source={imageSource}
        initials={resolvedInitials}
        size="xl"
        accessibilityLabel={name}
      />

      <View style={styles.identity}>
        <MobileText variant="heading" numberOfLines={2}>
          {name}
        </MobileText>
        {handle ? (
          <MobileText variant="callout" color="muted" numberOfLines={1}>
            {handle}
          </MobileText>
        ) : null}
      </View>

      {stats && stats.length > 0 ? (
        <MobileStack direction="row" gap={24} style={styles.stats}>
          {stats.map((stat, index) => (
            <View key={`${stat.label}-${index}`} style={styles.stat}>
              <MobileText variant="title" tabular numberOfLines={1}>
                {stat.value}
              </MobileText>
              <MobileText
                variant="caption"
                color="muted"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {stat.label}
              </MobileText>
            </View>
          ))}
        </MobileStack>
      ) : null}

      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    alignItems: "flex-start",
  },
  identity: {
    gap: 2,
  },
  stats: {
    alignItems: "center",
  },
  stat: {
    alignItems: "flex-start",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
  },
})
