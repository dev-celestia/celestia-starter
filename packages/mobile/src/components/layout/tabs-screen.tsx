import * as React from "react"
import { StyleSheet } from "react-native"
import { MobileTabBar } from "../composite/tab-bar"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileTabsScreenTab {
  /** Stable identity passed back through `onChange`. */
  key: string
  label: string
  icon?: React.ReactNode
}

export interface MobileTabsScreenProps
  extends Omit<
    MobileScreenProps,
    "children" | "footer" | "footerBordered" | "contentContainerStyle"
  > {
  /** Tab definitions, in bar order. */
  tabs: MobileTabsScreenTab[]
  /** Key of the visible tab. */
  active: string
  /** Called with the tapped tab's key. */
  onChange: (key: string) => void
  /** Header title. */
  title?: string
  /**
   * Whether the content slot scrolls. Turn this off when the tab's own content
   * manages scrolling (a list, a map) — two nested scrollers fight.
   * @default true
   */
  scroll?: boolean
  /** The active tab's content. */
  children: React.ReactNode
}

/**
 * MobileTabsScreen
 *
 * Bottom-tab shell: optional header, the active tab's content, and a
 * `MobileTabBar` pinned to the thumb edge.
 *
 * The screen is deliberately stateless about which tab is showing — `active`
 * in, `onChange` out. The caller owns the switch, which keeps the shell
 * presentational and lets it live under any navigation scheme without knowing
 * about it.
 *
 * The tab bar rides `MobileScreen`'s pinned footer slot, so the bottom
 * safe-area inset is the frame's job, not the bar's, and the bar never scrolls
 * away with content.
 */
export function MobileTabsScreen({
  tabs,
  active,
  onChange,
  title,
  scroll = true,
  children,
  ...screenProps
}: MobileTabsScreenProps) {
  return (
    <MobileScreen
      {...screenProps}
      title={title}
      scroll={scroll}
      contentContainerStyle={scroll ? styles.content : undefined}
      footerBordered={false}
      footer={
        <MobileTabBar items={tabs} activeKey={active} onTabPress={onChange} />
      }
    >
      {children}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
})
