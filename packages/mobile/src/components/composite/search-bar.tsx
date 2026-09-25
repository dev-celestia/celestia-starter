import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileTextInput } from "../primitive/input"

export interface MobileSearchBarProps {
  /**
   * Current query.
   */
  value: string
  /**
   * Called on every edit.
   */
  onValueChange: (value: string) => void
  /**
   * Placeholder text.
   * @default 'Search'
   */
  placeholder?: string
  /**
   * Called when the user submits (keyboard return key).
   */
  onSubmit?: (value: string) => void
  /**
   * Called after the clear affordance empties the field.
   */
  onClear?: () => void
  /**
   * Focus the field as soon as it mounts.
   * @default false
   */
  autoFocus?: boolean
  /**
   * @default false
   */
  disabled?: boolean
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
 * SearchGlyph
 *
 * Magnifier drawn with two Views rather than pulled from an icon set — the
 * package takes no icon dependency, and this mark is *structural* (it says
 * "this is a search field"), not decorative.
 */
function SearchGlyph({ color }: { color: string }) {
  return (
    <View style={styles.glyph}>
      <View style={[styles.glyphCircle, { borderColor: color }]} />
      <View style={[styles.glyphHandle, { backgroundColor: color }]} />
    </View>
  )
}

/**
 * MobileSearchBar
 *
 * `MobileTextInput` pre-composed for search: leading magnifier, clear
 * affordance once there is a query, and a submit handler wired to the keyboard
 * return key.
 */
export function MobileSearchBar({
  value,
  onValueChange,
  placeholder = "Search",
  onSubmit,
  onClear,
  autoFocus = false,
  disabled = false,
  style,
  testID,
}: MobileSearchBarProps) {
  const { colors } = useMobileTheme()

  return (
    <MobileTextInput
      testID={testID}
      containerStyle={style}
      value={value}
      onChangeText={onValueChange}
      placeholder={placeholder}
      leading={<SearchGlyph color={colors.muted} />}
      clearable
      onClear={onClear}
      autoFocus={autoFocus}
      editable={!disabled}
      returnKeyType="search"
      autoCapitalize="none"
      autoCorrect={false}
      accessibilityLabel={placeholder}
      onSubmitEditing={() => onSubmit?.(value)}
    />
  )
}

const styles = StyleSheet.create({
  glyph: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  glyphCircle: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.5,
  },
  glyphHandle: {
    position: "absolute",
    width: 5,
    height: 1.5,
    borderRadius: 1,
    right: 0,
    bottom: 2,
    transform: [{ rotate: "45deg" }],
  },
})
