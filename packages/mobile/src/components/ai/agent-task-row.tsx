import * as React from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"
import { MobileText } from "../primitive/text"
import { MobileSpinner } from "../primitive/spinner"

export type MobileAgentTaskStatus =
  | "pending"
  | "running"
  | "success"
  | "error"
  | "skipped"

export interface MobileAgentTask {
  /** Stable key. */
  id: string
  /** Task description, e.g. "Search the web for pricing". */
  title: string
  /** Lifecycle state. */
  status: MobileAgentTaskStatus
  /** Optional secondary line — a result summary or a failure reason. */
  detail?: string
}

export interface MobileAgentTaskRowProps {
  /**
   * The step to render.
   */
  task: MobileAgentTask
  /**
   * 1-based position, shown as a step counter.
   */
  index?: number
  /**
   * Total step count, shown as "index / total".
   */
  total?: number
  /**
   * Draws the connecting line below the status node. Omit on the last step.
   * @default false
   */
  connector?: boolean
  /**
   * Fires on tap. Omit to render the row as static text.
   */
  onPress?: () => void
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const STATUS_LABEL: Record<MobileAgentTaskStatus, string> = {
  pending: "Waiting",
  running: "Running",
  success: "Completed",
  error: "Failed",
  skipped: "Skipped",
}

/**
 * MobileAgentTaskRow
 *
 * One step in an agent's plan, on a vertical rail.
 *
 * The rail — a connector line drawn *behind* the status node — is what makes a
 * list of steps read as a sequence rather than as an unrelated checklist, and
 * it is why the row takes an explicit `connector` flag instead of inferring
 * position: the caller knows whether another row follows.
 *
 * Status is tri-modal: a spinner while running, a glyph when settled, and a
 * word (`STATUS_LABEL`) for assistive tech. The word matters most for
 * `skipped`, which has no natural glyph and would otherwise be indistinguishable
 * from `pending`.
 */
export function MobileAgentTaskRow({
  task,
  index,
  total,
  connector = false,
  onPress,
  style,
  testID,
}: MobileAgentTaskRowProps) {
  const { colors } = useMobileTheme()

  const tone =
    task.status === "error"
      ? colors.destructive
      : task.status === "success"
        ? colors.success
        : task.status === "running"
          ? colors.primary
          : colors.muted

  const glyph =
    task.status === "success"
      ? "\u2713"
      : task.status === "error"
        ? "!"
        : task.status === "skipped"
          ? "\u2013"
          : "\u25CB"

  const body = (
    <>
      <View style={styles.rail}>
        <View
          style={[
            styles.node,
            {
              borderColor: tone,
              backgroundColor:
                task.status === "success" || task.status === "error"
                  ? tone
                  : colors.background,
            },
          ]}
        >
          {task.status === "running" ? (
            <MobileSpinner size="small" color={tone} />
          ) : (
            <MobileText
              variant="caption"
              style={{
                color:
                  task.status === "success" || task.status === "error"
                    ? colors.background
                    : tone,
                fontWeight: "700",
              }}
            >
              {glyph}
            </MobileText>
          )}
        </View>

        {connector ? (
          <View
            style={[
              styles.connector,
              {
                backgroundColor:
                  task.status === "success" ? colors.success : colors.border,
              },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <MobileText
            variant="callout"
            numberOfLines={2}
            style={[
              styles.title,
              {
                color:
                  task.status === "skipped" ? colors.muted : colors.foreground,
              },
            ]}
          >
            {task.title}
          </MobileText>

          {index != null ? (
            <MobileText variant="caption" color="muted" tabular>
              {total != null ? `${index}/${total}` : String(index)}
            </MobileText>
          ) : null}
        </View>

        <MobileText variant="caption" color={tone}>
          {STATUS_LABEL[task.status]}
        </MobileText>

        {task.detail ? (
          <MobileText
            variant="caption"
            color="muted"
            numberOfLines={3}
            style={styles.detail}
          >
            {task.detail}
          </MobileText>
        ) : null}
      </View>
    </>
  )

  if (!onPress) {
    return (
      <View testID={testID} style={[styles.row, style]}>
        {body}
      </View>
    )
  }

  return (
    <Pressable
      onPress={() => {
        hapticLight()
        onPress()
      }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Step ${index ?? ""}: ${task.title}, ${STATUS_LABEL[task.status]}`}
      style={[styles.row, style]}
    >
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minHeight: metrics.minTouchTarget,
  },
  rail: {
    alignItems: "center",
    alignSelf: "stretch",
    width: 24,
  },
  node: {
    width: 22,
    height: 22,
    borderRadius: metrics.radius.full,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  connector: {
    flex: 1,
    width: 1.5,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    gap: 2,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    fontWeight: "500",
  },
  detail: {
    marginTop: 2,
  },
})
