import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { useSpringValue } from "../../motion"
import { metrics } from "../../tokens"
import { hapticSelect } from "../../utils"
import { MobileCollapsible } from "./collapsible"
import { MobileText } from "./text"

export interface MobileAccordionItem {
  /** Stable identity — also used as the React key. */
  id: string
  /** Header row title. */
  title: string
  /** Body revealed when the item is open. */
  content: React.ReactNode
}

export interface MobileAccordionProps {
  /**
   * Sections to render, top to bottom.
   */
  items: MobileAccordionItem[]
  /**
   * Id of the item that starts open. Omit for a fully collapsed accordion.
   */
  defaultOpenId?: string
  /**
   * Optional style override for the outer container.
   */
  style?: ViewStyle
}

/**
 * MobileAccordion
 *
 * Disclosure list with one-open-at-a-time semantics: opening a section closes
 * the previous one, so a long list never grows into a scroll of everything.
 * Tapping the open header collapses it.
 *
 * The reveal reuses `MobileCollapsible` — its JS-thread height spring is the
 * house pattern for disclosure. The chevron rotates on its *own* Animated.Value
 * with the native driver, because one value cannot feed both a layout prop and
 * a native-driver transform.
 */
export function MobileAccordion({
  items,
  defaultOpenId,
  style,
}: MobileAccordionProps) {
  const { colors } = useMobileTheme()
  const [openId, setOpenId] = React.useState<string | undefined>(defaultOpenId)

  const handleToggle = (id: string) => {
    hapticSelect()
    setOpenId((current) => (current === id ? undefined : id))
  }

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.card },
        style,
      ]}
    >
      {items.map((item, index) => (
        <AccordionRow
          key={item.id}
          item={item}
          open={openId === item.id}
          onToggle={handleToggle}
          // The container already draws the outer border; a bottom hairline on
          // the last row would double it.
          isLast={index === items.length - 1}
        />
      ))}
    </View>
  )
}

interface AccordionRowProps {
  item: MobileAccordionItem
  open: boolean
  onToggle: (id: string) => void
  isLast: boolean
}

function AccordionRow({ item, open, onToggle, isLast }: AccordionRowProps) {
  const { colors } = useMobileTheme()
  // Transform only — native driver is fine here. Kept separate from
  // MobileCollapsible's JS-thread height spring.
  const chevron = useSpringValue(open ? 1 : 0)

  return (
    <View
      style={[
        styles.row,
        { borderColor: colors.border },
        isLast && styles.lastRow,
      ]}
    >
      <Pressable
        onPress={() => onToggle(item.id)}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        accessibilityState={{ expanded: open }}
        style={styles.header}
      >
        <MobileText variant="bodyMedium" style={styles.title}>
          {item.title}
        </MobileText>
        <Animated.View
          pointerEvents="none"
          style={{
            transform: [
              {
                // "›" points right closed, down open — one glyph, rotated.
                rotate: chevron.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "90deg"],
                }),
              },
            ],
          }}
        >
          <MobileText
            variant="callout"
            style={{ color: colors.muted, fontSize: 16 }}
          >
            ›
          </MobileText>
        </Animated.View>
      </Pressable>

      <MobileCollapsible open={open}>
        <View style={styles.content}>{item.content}</View>
      </MobileCollapsible>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  header: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    gap: 8,
  },
  title: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
})
