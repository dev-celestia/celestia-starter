import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileSkeleton } from "../primitive/skeleton"
import { metrics } from "../../tokens"

export interface MobileSkeletonCardProps {
  /**
   * Number of body text bars beneath the title. The last one is drawn at 60%
   * width so the block reads as ragged-right copy rather than a hard rectangle.
   * @default 2
   */
  lines?: number
  /**
   * Prepends a 16:9 media placeholder — for cards that lead with an image,
   * thumbnail or banner.
   * @default false
   */
  media?: boolean
  /** Optional style override. */
  style?: ViewStyle
  /** Test identifier. */
  testID?: string
}

/**
 * MobileSkeletonCard
 *
 * A card-shaped loading placeholder: an optional 16:9 media block, a title bar,
 * and a stack of body bars inside a bordered card surface. It composes the
 * primitive `MobileSkeleton` and, like it, is hidden from assistive technology —
 * the assembly carries `accessible={false}` so a screen reader hears the
 * screen's loading state instead of empty boxes.
 */
export function MobileSkeletonCard({
  lines = 2,
  media = false,
  style,
  testID,
}: MobileSkeletonCardProps) {
  const { colors } = useMobileTheme()
  const count = Math.max(0, Math.floor(lines))

  return (
    <View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        style,
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.lg,
        },
      ]}
    >
      {media ? (
        <View style={styles.media}>
          <MobileSkeleton
            width="100%"
            radius={metrics.radius.md}
            style={styles.mediaFill}
          />
        </View>
      ) : null}

      <MobileSkeleton width="60%" height={16} style={styles.title} />

      <View style={styles.body}>
        {Array.from({ length: count }, (_, index) => (
          <MobileSkeleton
            key={index}
            width={index === count - 1 ? "60%" : "100%"}
            height={12}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
  },
  media: {
    width: "100%",
    aspectRatio: 16 / 9,
    marginBottom: 12,
  },
  mediaFill: {
    height: "100%",
  },
  title: {
    marginBottom: 12,
  },
  body: {
    gap: 8,
  },
})
