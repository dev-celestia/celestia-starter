import * as React from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor } from "../../utils"
import { MobileText } from "../primitive/text"

export interface MobileAiModel {
  /** Stable id, passed back to `onChange`. */
  id: string
  /** Display name, e.g. "Celestia Pro". */
  name: string
  /** Secondary line, e.g. "Fast · 128k context". Used in the vertical layout. */
  description?: string
  /** Short trailing badge, e.g. "Pro" or "Beta". */
  badge?: string
  /**
   * Unavailable models stay visible but unselectable — hiding them makes the
   * tier ladder invisible, which is exactly what an upsell depends on.
   * @default false
   */
  disabled?: boolean
}

export interface MobileModelSelectorProps {
  /**
   * Selectable models, in display order.
   */
  models: MobileAiModel[]
  /**
   * Selected model id.
   */
  value?: string
  /**
   * Fires with the chosen id. Omit to render a read-only readout.
   */
  onChange?: (id: string) => void
  /**
   * `horizontal` is the composer picker (a scrolling pill row); `vertical` is
   * the settings-page list with descriptions.
   * @default 'horizontal'
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const PILL_HEIGHT = 34
const ROW_HEIGHT = 56

/**
 * MobileModelSelector
 *
 * Picks which model answers: a pill row for the composer, a described list for
 * settings.
 *
 * Disabled models are **rendered, not filtered**. The tier ladder — what you
 * have, what you could have — is the point of showing a model list at all;
 * removing the locked entries leaves a user unable to see what upgrading buys.
 * They are announced as disabled rather than as unavailable text.
 */
export function MobileModelSelector({
  models,
  value,
  onChange,
  orientation = "horizontal",
  style,
  testID,
}: MobileModelSelectorProps) {
  const { colors } = useMobileTheme()

  if (orientation === "horizontal") {
    const slop = hitSlopFor(PILL_HEIGHT)

    return (
      <ScrollView
        testID={testID}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.pillRow, style]}
      >
        {models.map((model) => {
          const selected = model.id === value
          const disabled = model.disabled ?? false

          return (
            <Pressable
              key={model.id}
              onPress={
                onChange && !disabled
                  ? () => {
                      hapticLight()
                      onChange(model.id)
                    }
                  : undefined
              }
              disabled={disabled || !onChange}
              accessibilityRole="button"
              accessibilityLabel={`${model.name}${model.badge ? `, ${model.badge}` : ""}`}
              accessibilityState={{ selected, disabled }}
              hitSlop={{ top: slop, bottom: slop }}
              style={[
                styles.pill,
                {
                  minHeight: PILL_HEIGHT,
                  borderRadius: metrics.radius.full,
                  backgroundColor: selected ? colors.primary : colors.secondary,
                  borderColor: selected ? colors.primary : colors.inputBorder,
                  opacity: disabled ? 0.45 : 1,
                },
              ]}
            >
              <MobileText
                variant="callout"
                style={{
                  color: selected
                    ? colors.primaryForeground
                    : colors.foreground,
                  fontWeight: selected ? "600" : "500",
                }}
              >
                {model.name}
              </MobileText>
              {model.badge ? (
                <View
                  style={[
                    styles.badge,
                    {
                      borderRadius: metrics.radius.full,
                      backgroundColor: selected
                        ? colors.primaryForeground
                        : colors.mutedBackground,
                    },
                  ]}
                >
                  <MobileText
                    variant="label"
                    style={{
                      color: selected ? colors.primary : colors.muted,
                    }}
                  >
                    {model.badge}
                  </MobileText>
                </View>
              ) : null}
            </Pressable>
          )
        })}
      </ScrollView>
    )
  }

  return (
    <View
      testID={testID}
      style={[
        styles.list,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.md,
        },
        style,
      ]}
    >
      {models.map((model, index) => {
        const selected = model.id === value
        const disabled = model.disabled ?? false

        return (
          <Pressable
            key={model.id}
            onPress={
              onChange && !disabled
                ? () => {
                    hapticLight()
                    onChange(model.id)
                  }
                : undefined
            }
            disabled={disabled || !onChange}
            accessibilityRole="radio"
            accessibilityLabel={`${model.name}${model.description ? `, ${model.description}` : ""}`}
            accessibilityState={{ selected, disabled }}
            style={[
              styles.row,
              {
                minHeight: ROW_HEIGHT,
                opacity: disabled ? 0.45 : 1,
                borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowText}>
              <View style={styles.rowTitle}>
                <MobileText variant="callout" style={{ fontWeight: "600" }}>
                  {model.name}
                </MobileText>
                {model.badge ? (
                  <View
                    style={[
                      styles.badge,
                      {
                        borderRadius: metrics.radius.full,
                        backgroundColor: colors.mutedBackground,
                      },
                    ]}
                  >
                    <MobileText variant="label" color="muted">
                      {model.badge}
                    </MobileText>
                  </View>
                ) : null}
              </View>
              {model.description ? (
                <MobileText variant="caption" color="muted">
                  {model.description}
                </MobileText>
              ) : null}
            </View>

            {/* The selected mark is a glyph, not just a tinted row, so the
                choice survives a greyscale render. */}
            <View
              style={[
                styles.check,
                {
                  borderColor: selected ? colors.primary : colors.inputBorder,
                  backgroundColor: selected ? colors.primary : "transparent",
                  borderRadius: metrics.radius.full,
                },
              ]}
            >
              {selected ? (
                <MobileText
                  variant="caption"
                  style={{ color: colors.primaryForeground, fontWeight: "700" }}
                >
                  {"\u2713"}
                </MobileText>
              ) : null}
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  pillRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
    paddingRight: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  list: {
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  check: {
    width: 20,
    height: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})
