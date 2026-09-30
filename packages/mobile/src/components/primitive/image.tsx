import * as React from "react"
import {
  Animated,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { canUseNativeDriver } from "../../motion"
import { metrics } from "../../tokens"

export interface MobileImageProps {
  /** Image source — a remote URI object or a `require()`d asset. */
  source: ImageSourcePropType
  /**
   * Width-to-height ratio the box is locked to. Omit to let the parent's
   * layout size the frame.
   */
  ratio?: number
  /**
   * Corner radius in points.
   * @default metrics.radius.md
   */
  radius?: number
  /**
   * Rendered in place of the image when the source fails to load. Without a
   * fallback, a failed load leaves the muted placeholder box.
   */
  fallback?: React.ReactNode
  /** Screen-reader description. */
  accessibilityLabel?: string
  style?: ViewStyle
}

/**
 * MobileImage
 *
 * Image frame with the house fade-in: the picture starts at opacity 0 and
 * times in over 200ms on `onLoadEnd` — which fires on error too, so a broken
 * source can never strand the frame invisible. Errors swap in `fallback` when
 * one was supplied.
 */
export function MobileImage({
  source,
  ratio,
  radius = metrics.radius.md,
  fallback,
  accessibilityLabel,
  style,
}: MobileImageProps) {
  const { colors } = useMobileTheme()
  const imageOpacity = React.useRef(new Animated.Value(0)).current
  const [failed, setFailed] = React.useState(false)

  // A new source gets a fresh fade rather than popping in over the old one.
  React.useEffect(() => {
    setFailed(false)
    imageOpacity.setValue(0)
  }, [source, imageOpacity])

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.frame,
        {
          borderRadius: radius,
          backgroundColor: colors.mutedBackground,
          aspectRatio: ratio,
        },
        style,
      ]}
    >
      {failed && fallback ? (
        <View style={styles.fallback}>{fallback}</View>
      ) : (
        <Animated.Image
          source={source}
          onError={() => setFailed(true)}
          onLoadEnd={() => {
            Animated.timing(imageOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: canUseNativeDriver,
            }).start()
          }}
          style={[styles.image, { opacity: imageOpacity }]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
})
