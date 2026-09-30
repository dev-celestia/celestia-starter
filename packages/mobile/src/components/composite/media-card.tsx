import * as React from "react"
import { StyleSheet, View, type ImageSourcePropType } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileCard } from "../primitive/card"
import { MobileImage } from "../primitive/image"
import { MobilePressableScale } from "../primitive/pressable-scale"

export interface MobileMediaCardProps {
  /**
   * Hero image source.
   */
  source: ImageSourcePropType
  /**
   * Optional title under the image.
   */
  title?: string
  /**
   * Optional muted line under the title.
   */
  subtitle?: string
  /**
   * Image aspect ratio (width / height).
   * @default 16 / 9
   */
  ratio?: number
  /**
   * Makes the whole card pressable (with a scale-down on press). Omit for a
   * purely informational card.
   */
  onPress?: () => void
}

/**
 * MobileMediaCard
 *
 * Edge-to-edge image in a card with a title/subtitle block below. The card's
 * `overflow: hidden` rounds the image corners, so the image itself stays
 * square-cornered. Press handling swaps the container for a pressable-scale
 * only when `onPress` exists — a card that shrinks but goes nowhere reads as
 * broken.
 */
export function MobileMediaCard({
  source,
  title,
  subtitle,
  ratio = 16 / 9,
  onPress,
}: MobileMediaCardProps) {
  const card = (
    <MobileCard style={styles.card}>
      <MobileImage source={source} ratio={ratio} style={styles.image} />
      {title || subtitle ? (
        <View style={styles.textBlock}>
          {title ? (
            <MobileText variant="title" numberOfLines={2}>
              {title}
            </MobileText>
          ) : null}
          {subtitle ? (
            <MobileText
              variant="callout"
              color="muted"
              numberOfLines={2}
              style={styles.subtitle}
            >
              {subtitle}
            </MobileText>
          ) : null}
        </View>
      ) : null}
    </MobileCard>
  )

  if (!onPress) return card

  // PressableScale's contract carries no a11y props; the title text inside
  // the card is what a screen reader announces.
  return <MobilePressableScale onPress={onPress}>{card}</MobilePressableScale>
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
  },
  image: {
    width: "100%",
  },
  textBlock: {
    padding: 14,
    gap: 2,
  },
  subtitle: {
    marginTop: 2,
  },
})
