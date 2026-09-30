import * as React from "react"
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useMobileTheme } from "../../host"
import { springTo } from "../../motion"
import { metrics } from "../../tokens"
import { isTextChildren } from "../../utils"
import { MobileText } from "./text"

export interface MobileModalProps {
  /**
   * Whether the modal is presented. Controlled — the parent owns the state.
   */
  visible: boolean
  /**
   * Called on backdrop press and on the platform back gesture/button.
   */
  onClose: () => void
  /**
   * Optional heading rendered above the body.
   */
  title?: string
  /**
   * Body content. Plain strings are wrapped in `MobileText` automatically.
   */
  children: React.ReactNode
  /**
   * Optional action row rendered below the body (buttons, links).
   */
  footer?: React.ReactNode
}

/**
 * MobileModal
 *
 * RN `Modal` with the house entrance: the backdrop fades while the panel
 * springs up from 0.94 scale / 16pt below, one shared Animated.Value driving
 * all three so the motion cannot desync. `animationType="none"` because the
 * spring *is* the entrance animation — a second, platform one would fight it.
 *
 * Backdrop press closes; the panel itself is wrapped in a no-op `Pressable`
 * purely to claim touches, since a plain View lets them fall through to the
 * backdrop responder underneath.
 */
export function MobileModal({
  visible,
  onClose,
  title,
  children,
  footer,
}: MobileModalProps) {
  const { colors } = useMobileTheme()
  const progress = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (!visible) {
      // Reset so the next open springs from the start pose.
      progress.setValue(0)
      return
    }
    springTo(progress, 1).start()
  }, [visible, progress])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.fill}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
        >
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "#000000",
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                  extrapolate: "clamp",
                }),
              },
            ]}
          />
        </Pressable>

        <View style={styles.center} pointerEvents="box-none">
          <Pressable onPress={() => {}} style={styles.panelClaim}>
            <Animated.View
              style={[
                styles.panel,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                    extrapolate: "clamp",
                  }),
                  transform: [
                    {
                      scale: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.94, 1],
                        extrapolate: "clamp",
                      }),
                    },
                    {
                      translateY: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
              ]}
            >
              {title ? (
                <MobileText variant="title" style={styles.title}>
                  {title}
                </MobileText>
              ) : null}

              {isTextChildren(children) ? (
                <MobileText variant="body">{children}</MobileText>
              ) : (
                children
              )}

              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  panelClaim: {
    // Full width up to a readable measure, centred; claims touches so they
    // never fall through to the backdrop responder below.
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
  },
  panel: {
    width: "100%",
    borderRadius: metrics.radius.lg,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  title: {
    marginBottom: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 6,
  },
})
