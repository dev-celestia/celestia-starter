import * as React from "react"
import { View } from "react-native"
import {
  MobileButton,
  MobileFilterChips,
  MobileIconButton,
  MobileInfiniteScrollFooter,
  MobileNavBar,
  MobilePageDots,
  MobilePagination,
  MobileSearchBar,
  MobileSegmentedControl,
  MobileTabBar,
  MobileTabs,
  MobileText,
  MobileThemeSelector,
  MobileToolbar,
  MobileWizardStepper,
  useMobileTheme,
  type MobileFilterChipOption,
  type MobileInfiniteScrollFooterState,
  type MobileSegmentedControlOption,
  type MobileTabItem,
  type MobileTabsItem,
  type MobileThemeValue,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon, type ShowcaseIconName } from "../icons"
import { DemoLabel, Readout, Row, SPACE, Spacer, Specimen, Stack } from "../ui"
import { ADA } from "../sample-data"

/**
 * Navigation chrome — the modules that tell the user where they are, or offer
 * a way to somewhere else.
 *
 * `navbar`, `tab-bar`, `segmented-control`, `search-bar`, `tabs`, `page-dots`,
 * `wizard-stepper`, `filter-chips`, `pagination`, `toolbar`, `theme-selector`,
 * `infinite-scroll-footer`.
 *
 * None of these navigate. They render the current location and emit the intent
 * to change it; the host app owns the router. That is why `activeKey` and
 * `value` are controlled props with no internal state — a nav bar that kept its
 * own copy of the route would be able to disagree with the actual screen.
 */

/**
 * Tab definitions, deliberately without their icons.
 *
 * `MobileTabBar` takes a node rather than a render prop, so the icon's colour
 * has to be decided by the caller — and the correct colour depends on which tab
 * is active. Holding only the semantic name here and building the node inside
 * the component is what lets the icon follow the same active/inactive tint as
 * the label beside it.
 */
type TabDefinition = Omit<MobileTabItem, "icon"> & { icon: ShowcaseIconName }

const TABS: TabDefinition[] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "search", label: "Search", icon: "search", badge: 3 },
  { key: "inbox", label: "Inbox", icon: "mail", badge: "12" },
  { key: "settings", label: "Settings", icon: "settings" },
  { key: "archive", label: "Archive", icon: "archive", disabled: true },
]

const RANGES: MobileSegmentedControlOption[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year", disabled: true },
]

const UNDERLINE_TABS: MobileTabsItem[] = [
  { key: "overview", label: "Overview" },
  { key: "activity", label: "Activity" },
  { key: "files", label: "Files" },
]

const WIZARD_STEPS = ["Profile", "Preferences", "Review"]

const FILTER_OPTIONS: MobileFilterChipOption[] = [
  { value: "bug", label: "Bugs" },
  { value: "feature", label: "Features" },
  { value: "docs", label: "Docs" },
  { value: "chore", label: "Chores" },
]

const FEED_STATES: MobileInfiniteScrollFooterState[] = [
  "loading",
  "error",
  "end",
]

export function NavigationSection({ ctx }: { ctx: ShowcaseContext }) {
  const { colors } = useMobileTheme()
  const [tab, setTab] = React.useState("home")
  const [range, setRange] = React.useState("week")
  const [query, setQuery] = React.useState("")
  const [submitted, setSubmitted] = React.useState("—")
  const [underlineTab, setUnderlineTab] = React.useState("overview")
  const [dotIndex, setDotIndex] = React.useState(0)
  const [wizardStep, setWizardStep] = React.useState(0)
  const [filters, setFilters] = React.useState<string[]>(["bug"])
  const [page, setPage] = React.useState(3)
  const [theme, setTheme] = React.useState<MobileThemeValue>("system")
  const [feedState, setFeedState] =
    React.useState<MobileInfiniteScrollFooterState>("loading")

  /**
   * `MobileTabBar` tints its label from the active state but renders `icon`
   * untouched, so the same rule is applied by hand here — mirrored rather than
   * shared, because the bar's tint is internal to it.
   */
  const tabItems: MobileTabItem[] = TABS.map(({ icon, ...item }) => ({
    ...item,
    icon: (
      <ShowcaseIcon
        name={icon}
        size="md"
        color={item.key === tab ? colors.primary : colors.muted}
      />
    ),
  }))

  return (
    <View>
      <Specimen
        title="Nav bars"
        description="onBack is what makes the back chevron appear — there is no separate showBack flag to keep in sync. left and right take any node, so the trailing slot can hold one button or three. Bleed: a nav bar draws its own edge-to-edge chrome, so it must not inherit the card's content padding."
        modulePath="composite/navbar"
        bleed
      >
        <MobileNavBar title="Inbox" onBack={() => setSubmitted("nav back")} />
        <MobileNavBar
          title="Account"
          subtitle={ADA.email}
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
              icon={<ShowcaseIcon name="menu" size="md" />}
              accessibilityLabel="Open menu"
              variant="ghost"
              onPress={() => setSubmitted("menu")}
            />
          }
          right={
            <Row gap={SPACE.inline} wrap={false}>
              <MobileIconButton
                icon={<ShowcaseIcon name="search" size="md" />}
                accessibilityLabel="Search"
                variant="ghost"
                onPress={() => setSubmitted("search")}
              />
              <MobileIconButton
                icon={<ShowcaseIcon name="add" size="md" />}
                accessibilityLabel="Compose"
                variant="ghost"
                onPress={() => setSubmitted("compose")}
              />
            </Row>
          }
        />
        <MobileNavBar title="Unbordered" bordered={false} large />
      </Specimen>

      <Specimen
        title="Tab bars"
        description="Badges accept a string or a number, so a count and a dot can share one slot. A disabled tab is skipped by the press handler rather than silently doing nothing."
        modulePath="composite/tab-bar"
      >
        <MobileTabBar items={tabItems} activeKey={tab} onTabPress={setTab} />
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
        <Spacer size={SPACE.row} />
        <DemoLabel>Whole control disabled</DemoLabel>
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
        <Stack gap={SPACE.row}>
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

      <Specimen
        title="Tabs (underline)"
        description="The content-level sibling of the tab bar: an animated underline that springs between labels. Controlled like everything else here — value in, onChange out, no internal copy of the route."
        modulePath="primitive/tabs"
      >
        <MobileTabs
          tabs={UNDERLINE_TABS}
          value={underlineTab}
          onChange={setUnderlineTab}
        />
        <Spacer size={SPACE.row} />
        <MobileText variant="callout" color="muted">
          {underlineTab === "overview"
            ? "Overview — the summary panel a landing tab usually carries."
            : underlineTab === "activity"
              ? "Activity — a feed of recent events would render here."
              : "Files — attachments and uploads would render here."}
        </MobileText>
        <Readout label="value" value={underlineTab} />
      </Specimen>

      <Specimen
        title="Page dots"
        description="The pager indicator, decoupled from any pager: count and index are props, and tapping a dot is an intent the host can honour or ignore. The buttons below are the host."
        modulePath="primitive/page-dots"
      >
        <MobilePageDots count={5} index={dotIndex} onPressDot={setDotIndex} />
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.label}>
          <MobileButton
            size="sm"
            variant="outline"
            disabled={dotIndex === 0}
            onPress={() => setDotIndex((current) => Math.max(0, current - 1))}
          >
            Prev
          </MobileButton>
          <MobileButton
            size="sm"
            variant="outline"
            disabled={dotIndex === 4}
            onPress={() => setDotIndex((current) => Math.min(4, current + 1))}
          >
            Next
          </MobileButton>
        </Row>
        <Readout label="index" value={`${dotIndex} / 4`} />
      </Specimen>

      <Specimen
        title="Wizard stepper"
        description="Read-only progress header for multi-step flows: everything before current is done, everything after is upcoming. The flow logic — and the buttons that move it — belongs to the host."
        modulePath="composite/wizard-stepper"
      >
        <MobileWizardStepper steps={WIZARD_STEPS} current={wizardStep} />
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.label}>
          <MobileButton
            size="sm"
            variant="outline"
            disabled={wizardStep === 0}
            onPress={() => setWizardStep((current) => Math.max(0, current - 1))}
          >
            Back
          </MobileButton>
          <MobileButton
            size="sm"
            disabled={wizardStep === WIZARD_STEPS.length - 1}
            onPress={() =>
              setWizardStep((current) =>
                Math.min(WIZARD_STEPS.length - 1, current + 1)
              )
            }
          >
            {wizardStep === WIZARD_STEPS.length - 1 ? "Finished" : "Next step"}
          </MobileButton>
        </Row>
        <Readout
          label="current"
          value={`${wizardStep} — ${WIZARD_STEPS[wizardStep] ?? ""}`}
        />
      </Specimen>

      <Specimen
        title="Filter chips"
        description="Multi-select by design — a bar that only allows one choice is a segmented control. onToggle reports the tapped value and the caller decides whether that means add or remove."
        modulePath="composite/filter-chips"
      >
        <MobileFilterChips
          options={FILTER_OPTIONS}
          selected={filters}
          onToggle={(value) =>
            setFilters((current) =>
              current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
            )
          }
        />
        <Readout
          label="selected"
          value={filters.length === 0 ? "none" : filters.join(", ")}
        />
      </Specimen>

      <Specimen
        title="Pagination"
        description="Page numbers with a windowed middle and arrows that disable at the edges — onChange is never called with an out-of-bounds page."
        modulePath="composite/pagination"
      >
        <MobilePagination page={page} pageCount={12} onChange={setPage} />
        <Readout label="page" value={`${page} of 12`} />
      </Specimen>

      <Specimen
        title="Toolbar"
        description="A hairline-topped action shelf for icon buttons and short buttons. It lays children out; it has no opinion about what they do — every press below lands in the Last event readout."
        modulePath="primitive/toolbar"
      >
        <MobileToolbar>
          <MobileIconButton
            icon={<ShowcaseIcon name="share" size="md" />}
            accessibilityLabel="Share"
            variant="ghost"
            onPress={() => setSubmitted("toolbar · share")}
          />
          <MobileIconButton
            icon={<ShowcaseIcon name="star" size="md" />}
            accessibilityLabel="Star"
            variant="ghost"
            onPress={() => setSubmitted("toolbar · star")}
          />
          <MobileIconButton
            icon={<ShowcaseIcon name="trash" size="md" />}
            accessibilityLabel="Delete"
            variant="ghost"
            onPress={() => setSubmitted("toolbar · delete")}
          />
          <MobileButton
            size="sm"
            variant="outline"
            onPress={() => setSubmitted("toolbar · export")}
          >
            Export
          </MobileButton>
        </MobileToolbar>
        <Readout label="Last event" value={submitted} />
      </Specimen>

      <Specimen
        title="Theme selector"
        description="Light / dark / system in one control, including the system option's live glyph. Driven locally here — the gallery's own scheme is owned by the host above this section."
        modulePath="composite/theme-selector"
      >
        <MobileThemeSelector value={theme} onChange={setTheme} />
        <Readout label="Picked" value={theme} />
        <Readout label="Gallery scheme" value={ctx.scheme} />
      </Specimen>

      <Specimen
        title="Infinite scroll footer"
        description="The three tail states of a paginated feed: loading, error and end. Retry renders only when onRetry is passed — a button that cannot retry is a lie."
        modulePath="composite/infinite-scroll-footer"
      >
        <MobileInfiniteScrollFooter
          state={feedState}
          onRetry={() => setFeedState("loading")}
        />
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.label}>
          {FEED_STATES.map((state) => (
            <MobileButton
              key={state}
              size="sm"
              variant={state === feedState ? "default" : "outline"}
              onPress={() => setFeedState(state)}
            >
              {state}
            </MobileButton>
          ))}
        </Row>
      </Specimen>
    </View>
  )
}
