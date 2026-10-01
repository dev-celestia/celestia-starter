import * as React from "react"
import { Animated, type StyleProp, type TextStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { canUseNativeDriver } from "../../motion"
import type { ColorRamp } from "../../tokens"
import { MobileText, type MobileTextVariant } from "../primitive/text"

export interface MobileStreamingTextProps {
  /**
   * The text produced so far. Grows as tokens arrive — this component never
   * buffers or throttles, so the caller controls the reveal rate.
   */
  text: string
  /**
   * Appends a blinking caret while the model is still producing tokens.
   * @default false
   */
  streaming?: boolean
  /**
   * Typographic role, forwarded to `MobileText`.
   * @default 'body'
   */
  variant?: MobileTextVariant
  /**
   * Semantic colour key or raw colour string.
   * @default 'foreground'
   */
  color?: keyof ColorRamp | string
  /**
   * Caret colour. Defaults to `color`, so the caret matches the text it trails.
   */
  caretColor?: keyof ColorRamp | string
  /**
   * Optional style override, forwarded to `MobileText`.
   */
  style?: StyleProp<TextStyle>
  /**
   * Test identifier.
   */
  testID?: string
}

/** The block glyph that trails a live response. */
const CARET = "\u258D"
/** Half a blink cycle. 520ms reads as "waiting", not as a strobe. */
const BLINK_MS = 520
/** Floor of the blink — never fully invisible, or the caret reads as a glitch. */
const DIM = 0.15

function resolveColor(
  colors: ColorRamp,
  color: keyof ColorRamp | string
): string {
  return (color in colors ? colors[color as keyof ColorRamp] : color) as string
}

/**
 * MobileStreamingText
 *
 * Text that renders an assistant response *while it is still arriving*, with a
 * caret that blinks only while `streaming` is true.
 *
 * The caret is a nested `Animated.Text` inside the same `Text` node rather than
 * a sibling in a row: React Native then keeps it inline with the last line and
 * wraps it to the next line with the text, which a flex row cannot do. The
 * blink is an opacity loop on the native driver, so a fast token stream does
 * not compete with it for the JS thread.
 *
 * The caret is decorative — assistive tech is given the plain text via
 * `accessibilityLabel`, so a screen reader never reads the glyph.
 */
export function MobileStreamingText({
  text,
  streaming = false,
  variant = "body",
  color = "foreground",
  caretColor,
  style,
  testID,
}: MobileStreamingTextProps) {
  const { colors } = useMobileTheme()
  const blink = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    if (!streaming) {
      // Park the caret at full opacity so a stopped stream ends on a solid mark
      // rather than freezing mid-blink.
      blink.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: DIM,
          duration: BLINK_MS,
          useNativeDriver: canUseNativeDriver,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: BLINK_MS,
          useNativeDriver: canUseNativeDriver,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [streaming, blink])

  const resolvedCaret = resolveColor(colors, caretColor ?? color)

  return (
    <MobileText
      variant={variant}
      color={color}
      style={style}
      testID={testID}
      accessibilityLabel={text}
    >
      {text}
      {streaming ? (
        <Animated.Text style={{ color: resolvedCaret, opacity: blink }}>
          {CARET}
        </Animated.Text>
      ) : null}
    </MobileText>
  )
}
