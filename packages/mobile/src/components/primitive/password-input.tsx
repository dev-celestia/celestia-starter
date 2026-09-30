import * as React from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileTextInput } from "./input"
import { MobileText } from "./text"

export interface MobilePasswordInputProps {
  /**
   * Current password text.
   */
  value: string
  /**
   * Called on every keystroke.
   */
  onChangeText: (t: string) => void
  /**
   * Placeholder shown while empty.
   */
  placeholder?: string
  /**
   * Optional label rendered above the field.
   */
  label?: string
  /**
   * Error message rendered below the field; also flips the border to the
   * destructive colour.
   */
  error?: string
  /**
   * Renders the field non-editable at half opacity.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override for the outer container.
   */
  style?: ViewStyle
}

/**
 * MobilePasswordInput
 *
 * `MobileTextInput` with `secureTextEntry` plus a reveal toggle drawn as
 * simple shapes — an outlined almond with a pupil, crossed out while masked.
 * Drawing beats a dependency here: the eye is two Views and a rotated bar,
 * and no icon package can be smaller than that.
 *
 * The toggle lives in the input's `trailing` slot rather than using the
 * primitive's built-in `secure` text toggle, because a glyph reads instantly
 * at thumb distance where "Show"/"Hide" needs parsing.
 */
export function MobilePasswordInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  style,
}: MobilePasswordInputProps) {
  const { colors } = useMobileTheme()
  const [revealed, setRevealed] = React.useState(false)

  const inkColor = revealed ? colors.primary : colors.muted

  return (
    <View style={[styles.container, disabled ? styles.disabled : null, style]}>
      {label ? (
        <MobileText variant="callout" style={styles.label}>
          {label}
        </MobileText>
      ) : null}

      <MobileTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!revealed}
        error={Boolean(error)}
        editable={!disabled}
        accessibilityLabel={label ?? placeholder ?? "Password"}
        trailing={
          disabled ? null : (
            <Pressable
              onPress={() => setRevealed((current) => !current)}
              accessibilityRole="button"
              // The toggle's meaning flips with state, so the accessible name
              // has to as well.
              accessibilityLabel={revealed ? "Hide password" : "Show password"}
              accessibilityState={{ expanded: revealed }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.eyeButton}
            >
              <View
                style={[
                  styles.eye,
                  { borderColor: inkColor, borderRadius: metrics.radius.lg },
                ]}
              >
                <View style={[styles.pupil, { backgroundColor: inkColor }]} />
                {!revealed ? (
                  // Slash marks the masked state: "currently hidden, tap to
                  // reveal". Rotated bar, no glyph, no dependency.
                  <View style={[styles.slash, { backgroundColor: inkColor }]} />
                ) : null}
              </View>
            </Pressable>
          )
        }
      />

      {error ? (
        <MobileText
          variant="caption"
          style={{ color: colors.destructive, marginTop: 4 }}
        >
          {error}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
  },
  eyeButton: {
    minHeight: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  eye: {
    width: 22,
    height: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  pupil: {
    width: 5,
    height: 5,
    borderRadius: metrics.radius.full,
  },
  slash: {
    position: "absolute",
    width: 26,
    height: 1.5,
    borderRadius: metrics.radius.full,
    transform: [{ rotate: "-30deg" }],
  },
})
