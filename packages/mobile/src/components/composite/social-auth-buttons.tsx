import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileButton } from "../primitive/button"
import { MobileText } from "../primitive/text"

export interface MobileSocialProvider {
  /**
   * Stable identity, used as the React key and reported back on press.
   */
  id: string
  /**
   * Button caption, e.g. "Google".
   */
  label: string
  /**
   * Optional brand mark. Icons arrive as props.
   */
  icon?: React.ReactNode
}

export interface MobileSocialAuthButtonsProps {
  /**
   * Providers, laid out in the order given.
   */
  providers: MobileSocialProvider[]
  /**
   * Called with the pressed provider.
   */
  onProviderPress?: (provider: MobileSocialProvider) => void
  /**
   * Buttons per row.
   * @default 2
   */
  columns?: 1 | 2
  /**
   * Disables every button.
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
 * MobileSocialAuthButtons
 *
 * Row of outline buttons for federated sign-in (Google, Apple, …).
 *
 * Providers are chunked into rows explicitly rather than left to `flexWrap`.
 * Wrapping would let a row of three collapse to a lone button stretched across
 * the full width, which looks broken; chunking keeps every cell the same size
 * and pads the last row with a spacer instead.
 *
 * The buttons are keyed on the provider `id`, never the index.
 */
export function MobileSocialAuthButtons({
  providers,
  onProviderPress,
  columns = 2,
  disabled = false,
  style,
  testID,
}: MobileSocialAuthButtonsProps) {
  const { colors } = useMobileTheme()

  const rows = React.useMemo(() => {
    const chunked: MobileSocialProvider[][] = []
    for (let index = 0; index < providers.length; index += columns) {
      chunked.push(providers.slice(index, index + columns))
    }
    return chunked
  }, [providers, columns])

  return (
    <View testID={testID} style={[styles.container, style]}>
      {rows.map((row, rowIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rows are a deterministic chunking of the provider list
        <View key={`social-row-${rowIndex}`} style={styles.row}>
          {row.map((provider) => (
            <View key={provider.id} style={styles.cell}>
              <MobileButton
                variant="outline"
                disabled={disabled}
                onPress={() => onProviderPress?.(provider)}
                accessibilityLabel={provider.label}
              >
                {provider.icon ? (
                  <View style={styles.buttonContent}>
                    {provider.icon}
                    <MobileText
                      variant="bodyMedium"
                      // Matches the outline variant's own text colour so an
                      // icon + label pair renders identically to a plain label.
                      style={[styles.buttonLabel, { color: colors.foreground }]}
                    >
                      {provider.label}
                    </MobileText>
                  </View>
                ) : (
                  provider.label
                )}
              </MobileButton>
            </View>
          ))}

          {row.length < columns
            ? Array.from({ length: columns - row.length }).map((_, padIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length spacer run
                <View key={`social-pad-${padIndex}`} style={styles.cell} />
              ))
            : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  cell: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonLabel: {
    fontWeight: "600",
  },
})
