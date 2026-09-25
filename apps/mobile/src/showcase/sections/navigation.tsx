import * as React from "react"
import { View } from "react-native"
import {
  MobileIconButton,
  MobileNavBar,
  MobileSearchBar,
  MobileSegmentedControl,
  MobileTabBar,
  MobileText,
  type MobileSegmentedControlOption,
  type MobileTabItem,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { Glyph, Readout, Row, Spacer, Specimen, Stack } from "../ui"

/**
 * Navigation chrome — the four modules that tell the user where they are.
 *
 * `navbar`, `tab-bar`, `segmented-control`, `search-bar`.
 *
 * None of these navigate. They render the current location and emit the intent
 * to change it; the host app owns the router. That is why `activeKey` and
 * `value` are controlled props with no internal state — a nav bar that kept its
 * own copy of the route would be able to disagree with the actual screen.
 */

const TABS: MobileTabItem[] = [
  { key: "home", label: "Home", icon: <Glyph glyph="⌂" size="callout" /> },
  {
    key: "search",
    label: "Search",
    icon: <Glyph glyph="⌕" size="callout" />,
    badge: 3,
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: <Glyph glyph="✉" size="callout" />,
    badge: "12",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Glyph glyph="⚙" size="callout" />,
  },
  {
    key: "archive",
    label: "Archive",
    icon: <Glyph glyph="▤" size="callout" />,
    disabled: true,
  },
]

const RANGES: MobileSegmentedControlOption[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year", disabled: true },
]

export function NavigationSection({ ctx }: { ctx: ShowcaseContext }) {
  const [tab, setTab] = React.useState("home")
  const [range, setRange] = React.useState("week")
  const [query, setQuery] = React.useState("")
  const [submitted, setSubmitted] = React.useState("—")

  return (
    <View>
      <Specimen
        title="Nav bars"
        description="onBack is what makes the back chevron appear — there is no separate showBack flag to keep in sync. left and right take any node, so the trailing slot can hold one button or three."
        modulePath="composite/navbar"
      >
        <View style={{ marginHorizontal: -16 }}>
          <MobileNavBar title="Inbox" onBack={() => setSubmitted("nav back")} />
          <MobileNavBar
            title="Account"
            subtitle="ada@example.com"
            onBack={() => setSubmitted("nav back")}
          />
          <MobileNavBar
            title="Large title"
            large
            onBack={() => setSubmitted("nav back")}
          />
          <MobileNavBar
            title="With actions"
            onBack={() => setSubmitted("nav back")}
            left={
              <MobileIconButton
                icon={<Glyph glyph="≡" />}
                accessibilityLabel="Open menu"
                variant="ghost"
                onPress={() => setSubmitted("menu")}
              />
            }
            right={
              <Row gap={4} wrap={false}>
                <MobileIconButton
                  icon={<Glyph glyph="⌕" />}
                  accessibilityLabel="Search"
                  variant="ghost"
                  onPress={() => setSubmitted("search")}
                />
                <MobileIconButton
                  icon={<Glyph glyph="＋" />}
                  accessibilityLabel="Compose"
                  variant="ghost"
                  onPress={() => setSubmitted("compose")}
                />
              </Row>
            }
          />
          <MobileNavBar title="Unbordered" bordered={false} large />
        </View>
      </Specimen>

      <Specimen
        title="Tab bars"
        description="Badges accept a string or a number, so a count and a dot can share one slot. A disabled tab is skipped by the press handler rather than silently doing nothing."
        modulePath="composite/tab-bar"
      >
        <MobileTabBar items={TABS} activeKey={tab} onTabPress={setTab} />
        <Readout label="activeKey" value={tab} />
        <Readout label="Scheme in context" value={ctx.scheme} />
      </Specimen>

      <Specimen
        title="Segmented controls"
        description="A disabled segment stays visible so the option set does not change shape between states."
        modulePath="composite/segmented-control"
      >
        <MobileSegmentedControl
          options={RANGES}
          value={range}
          onValueChange={setRange}
        />
        <Spacer size={14} />
        <MobileText variant="caption" color="muted">
          Whole control disabled
        </MobileText>
        <Spacer size={8} />
        <MobileSegmentedControl
          options={RANGES}
          value="week"
          onValueChange={() => {}}
          disabled
        />
        <Readout label="Selected range" value={range} />
      </Specimen>

      <Specimen
        title="Search bars"
        description="onSubmit is the commit — that is where a query belongs. onClear fires after the value is emptied, so a caller can reset its own results without re-deriving from the empty string."
        modulePath="composite/search-bar"
      >
        <Stack gap={14}>
          <MobileSearchBar
            value={query}
            onValueChange={setQuery}
            placeholder="Search documents"
            onSubmit={(value) => setSubmitted(`submit · ${value}`)}
            onClear={() => setSubmitted("cleared")}
          />
          <MobileSearchBar value="" onValueChange={() => {}} disabled />
        </Stack>
        <Readout label="query" value={query === "" ? "—" : query} />
        <Readout label="Last event" value={submitted} />
      </Specimen>
    </View>
  )
}
