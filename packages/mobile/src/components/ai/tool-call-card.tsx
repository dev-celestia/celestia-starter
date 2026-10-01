import * as React from "react"
import {
  Pressable,
  StyleSheet,
  View,
  Animated,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor } from "../../utils"
import { MobileText } from "../primitive/text"
import { MobileSpinner } from "../primitive/spinner"
import { MobileCollapsible } from "../primitive/collapsible"
import { MobileAiCopyButton } from "./copy-button"
import { mobileMonoFont } from "./mono"

export type MobileToolCallStatus = "pending" | "running" | "success" | "error"

export interface MobileToolCallCardProps {
  /**
   * Tool / function name, e.g. "web_search" or "read_file".
   */
  name: string
  /**
   * Lifecycle state. Drives the glyph, the tone and the trailing label.
   * @default 'pending'
   */
  status?: MobileToolCallStatus
  /**
   * Serialised arguments, rendered as monospace. Typically `JSON.stringify`.
   */
  args?: string
  /**
   * Serialised result, rendered as monospace.
   */
  result?: string
  /**
   * Human-readable duration, e.g. "820ms". Shown once the call settles.
   */
  duration?: string
  /**
   * Leading icon slot. A status glyph is drawn when omitted.
   */
  icon?: React.ReactNode
  /**
   * Controlled disclosure state. Uncontrolled when omitted.
   */
  open?: boolean
  /**
   * Initial state for the uncontrolled case. Defaults to open while running.
   */
  defaultOpen?: boolean
  /**
   * Copy handler for the arguments block.
   */
  onCopyArgs?: () => void
  /**
   * Copy handler for the result block.
   */
  onCopyResult?: () => void
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const HEADER_HEIGHT = 44

const STATUS_LABEL: Record<MobileToolCallStatus, string> = {
  pending: "Queued",
  running: "Running",
  success: "Done",
  error: "Failed",
}

/**
 * MobileToolCallCard
 *
 * A single tool invocation in an agent transcript: which tool, with what
 * arguments, and what came back.
 *
 * The card is collapsed while queued and opens itself while running — a tool
 * call is the one transcript item whose *live* state the user is waiting on, so
 * hiding its progress would be the wrong default. `defaultOpen` follows the
 * initial `status` and is not re-applied afterwards, so a user who collapses the
 * card keeps it collapsed when the call settles.
 *
 * Status is carried by a glyph and a word as well as a colour: a spinner while
 * running, "✓ Done" on success, "! Failed" on error (WCAG 1.4.1).
 */
export function MobileToolCallCard({
  name,
  status = "pending",
  args,
  result,
  duration,
  icon,
  open,
  defaultOpen,
  onCopyArgs,
  onCopyResult,
  style,
  testID,
}: MobileToolCallCardProps) {
  const { colors } = useMobileTheme()

  const [internalOpen, setInternalOpen] = React.useState(
    defaultOpen ?? status === "running"
  )
  const isControlled = open !== undefined
  const expanded = isControlled ? open : internalOpen

  const chevron = React.useRef(new Animated.Value(expanded ? 1 : 0)).current
  React.useEffect(() => {
    Animated.timing(chevron, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start()
  }, [expanded, chevron])

  const tone =
    status === "error"
      ? colors.destructive
      : status === "success"
        ? colors.success
        : status === "running"
          ? colors.primary
          : colors.muted

  const handlePress = () => {
    hapticLight()
    if (!isControlled) setInternalOpen((value) => !value)
  }

  const slop = hitSlopFor(HEADER_HEIGHT)

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.md,
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Tool ${name}, ${STATUS_LABEL[status]}`}
        accessibilityState={{ expanded }}
        hitSlop={{ top: slop, bottom: slop }}
        style={styles.header}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: colors.mutedBackground,
              borderRadius: metrics.radius.sm,
            },
          ]}
        >
          {icon ??
            (status === "running" ? (
              <MobileSpinner size="small" color={tone} />
            ) : (
              <MobileText
                variant="caption"
                style={{ color: tone, fontWeight: "700" }}
              >
                {status === "success"
                  ? "\u2713"
                  : status === "error"
                    ? "!"
                    : "\u25CB"}
              </MobileText>
            ))}
        </View>

        <View style={styles.titleColumn}>
          <MobileText
            variant="callout"
            numberOfLines={1}
            style={{ fontFamily: mobileMonoFont, color: colors.foreground }}
          >
            {name}
          </MobileText>
          <MobileText variant="caption" color={tone}>
            {STATUS_LABEL[status]}
            {duration && status !== "running" ? ` · ${duration}` : ""}
          </MobileText>
        </View>

        <Animated.View
          style={{
            transform: [
              {
                rotate: chevron.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "90deg"],
                }),
              },
            ],
          }}
        >
          <MobileText variant="caption" color="muted">
            {"\u203A"}
          </MobileText>
        </Animated.View>
      </Pressable>

      <MobileCollapsible open={expanded}>
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {args ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MobileText
                  variant="label"
                  color="muted"
                  style={styles.sectionLabel}
                >
                  ARGUMENTS
                </MobileText>
                {onCopyArgs ? <MobileAiCopyButton onCopy={onCopyArgs} /> : null}
              </View>
              <MobileText
                variant="caption"
                style={[styles.mono, { color: colors.foreground }]}
              >
                {args}
              </MobileText>
            </View>
          ) : null}

          {result ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MobileText
                  variant="label"
                  color="muted"
                  style={styles.sectionLabel}
                >
                  RESULT
                </MobileText>
                {onCopyResult ? (
                  <MobileAiCopyButton onCopy={onCopyResult} />
                ) : null}
              </View>
              <MobileText
                variant="caption"
                style={[
                  styles.mono,
                  {
                    color:
                      status === "error"
                        ? colors.destructive
                        : colors.foreground,
                  },
                ]}
              >
                {result}
              </MobileText>
            </View>
          ) : null}
        </View>
      </MobileCollapsible>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    minHeight: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  titleColumn: {
    flex: 1,
    gap: 1,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  section: {
    gap: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionLabel: {
    letterSpacing: 0.6,
  },
  mono: {
    fontFamily: mobileMonoFont,
    fontSize: 12,
    lineHeight: 18,
  },
})
