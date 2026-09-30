import * as React from "react"
import { View } from "react-native"
import {
  MobileButton,
  MobileCheckbox,
  MobileChip,
  MobileFab,
  MobileIconButton,
  MobileMenu,
  MobilePressableScale,
  MobileRadioGroup,
  MobileRating,
  MobileSlider,
  MobileSpeedDial,
  MobileStepper,
  MobileSwatch,
  MobileSwitch,
  MobileText,
  MobileToggleGroup,
  metrics,
  useMobileTheme,
  type ColorRamp,
  type MobileButtonSize,
  type MobileButtonVariant,
  type MobileIconButtonSize,
  type MobileIconButtonVariant,
  type MobileMenuItem,
  type MobileRadioOption,
  type MobileSpeedDialAction,
  type MobileToggleGroupOption,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon } from "../icons"
import { DemoLabel, Readout, Row, SPACE, Spacer, Specimen, Stack } from "../ui"

/**
 * Actions — the modules whose whole job is to accept a gesture.
 *
 * `button`, `icon-button`, `checkbox`, `switch`, `slider`, `radio-group`,
 * `chip`, `toggle-group`, `rating`, `stepper`, `swatch`, `fab`,
 * `pressable-scale`, `menu` and the `speed-dial` composite.
 *
 * Every one of these commits a change, so every one fires haptics on the causal
 * frame: `Light` for a normal commit, `Medium` for a destructive one,
 * `selectionAsync` for a toggle. None of them fires on mount — a haptic that
 * arrives before the user touches anything reads as a bug.
 */

const BUTTON_VARIANTS: MobileButtonVariant[] = [
  "default",
  "secondary",
  "outline",
  "destructive",
  "ghost",
]

const BUTTON_SIZES: MobileButtonSize[] = ["sm", "default", "lg"]

const ICON_VARIANTS: MobileIconButtonVariant[] = [
  "default",
  "outline",
  "ghost",
  "destructive",
]

const ICON_SIZES: MobileIconButtonSize[] = ["sm", "md", "lg"]

/**
 * Each icon-button variant paints its own surface, so a single icon colour
 * would sit at the wrong contrast on two of the four: near-black on the primary
 * surface, near-white on the destructive one. This mirrors the text colour each
 * variant already uses for a string child.
 */
const ICON_VARIANT_FOREGROUND: Record<
  MobileIconButtonVariant,
  keyof ColorRamp
> = {
  default: "primaryForeground",
  outline: "foreground",
  ghost: "foreground",
  destructive: "destructiveForeground",
}

const PLAN_OPTIONS: MobileRadioOption[] = [
  {
    value: "starter",
    label: "Starter",
    description: "One workspace, community support",
  },
  {
    value: "pro",
    label: "Pro",
    description: "Unlimited workspaces, priority support",
  },
  {
    value: "team",
    label: "Team",
    description: "SSO, audit log, role-based access",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Contact sales — unavailable in this build",
    disabled: true,
  },
]

const SORT_OPTIONS: MobileToggleGroupOption[] = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
  { value: "nearby", label: "Nearby" },
]

const TAG_OPTIONS: MobileToggleGroupOption[] = [
  { value: "bug", label: "Bug" },
  { value: "design", label: "Design" },
  { value: "docs", label: "Docs" },
  { value: "urgent", label: "Urgent" },
]

/**
 * Product colours, not theme tokens — a swatch picker paints whatever the
 * caller hands it, so these literals are the point of the demo.
 */
const SWATCH_COLORS = [
  { name: "Ember", color: "#ef4444" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Moss", color: "#22c55e" },
  { name: "Harbour", color: "#3b82f6" },
  { name: "Iris", color: "#8b5cf6" },
] as const

export function ActionsSection({ ctx }: { ctx: ShowcaseContext }) {
  const { colors } = useMobileTheme()
  const [lastAction, setLastAction] = React.useState("—")
  const [terms, setTerms] = React.useState(true)
  const [marketing, setMarketing] = React.useState(false)
  const [notifications, setNotifications] = React.useState(true)
  const [analytics, setAnalytics] = React.useState(false)
  const [volume, setVolume] = React.useState(40)
  const [steppedVolume, setSteppedVolume] = React.useState(40)
  const [plan, setPlan] = React.useState("pro")
  const [chipSelected, setChipSelected] = React.useState(false)
  const [sortMode, setSortMode] = React.useState("recent")
  const [tags, setTags] = React.useState<string[]>(["design"])
  const [rating, setRating] = React.useState(3)
  const [quantity, setQuantity] = React.useState(2)
  const [swatch, setSwatch] = React.useState("Harbour")

  // Built during render: the icon nodes read the theme, and the callbacks
  // close over `setLastAction`.
  const DIAL_ACTIONS: MobileSpeedDialAction[] = [
    {
      label: "New note",
      icon: (
        <ShowcaseIcon
          name="capture"
          size="sm"
          color={colors.primaryForeground}
        />
      ),
      onPress: () => setLastAction("dial · new note"),
    },
    {
      label: "Organise",
      icon: (
        <ShowcaseIcon
          name="organise"
          size="sm"
          color={colors.primaryForeground}
        />
      ),
      onPress: () => setLastAction("dial · organise"),
    },
    {
      label: "Share link",
      icon: (
        <ShowcaseIcon name="share" size="sm" color={colors.primaryForeground} />
      ),
      onPress: () => setLastAction("dial · share link"),
    },
  ]

  const MENU_ITEMS: MobileMenuItem[] = [
    { label: "Edit project", onPress: () => setLastAction("menu · edit") },
    { label: "Duplicate", onPress: () => setLastAction("menu · duplicate") },
    {
      label: "Archive",
      disabled: true,
      onPress: () => setLastAction("should never fire"),
    },
    {
      label: "Delete project",
      destructive: true,
      onPress: () => setLastAction("menu · delete"),
    },
  ]

  const swatchColor =
    SWATCH_COLORS.find((candidate) => candidate.name === swatch)?.color ??
    SWATCH_COLORS[0].color

  return (
    <View>
      <Specimen
        title="Buttons"
        description="Five variants at the default size, drawn to the web Button's anatomy — a 32px surface, a 6px radius and a hard 2px bottom edge. The press slides the surface down over the edge, and the haptic fires on the commit frame, not on release."
        modulePath="primitive/button"
      >
        <Stack gap={SPACE.row}>
          {BUTTON_VARIANTS.map((variant) => (
            <MobileButton
              key={variant}
              variant={variant}
              onPress={() => setLastAction(`button · ${variant}`)}
            >
              {variant === "destructive"
                ? "Delete workspace (medium haptic)"
                : `${variant} action`}
            </MobileButton>
          ))}
        </Stack>

        <Spacer size={SPACE.block} />
        <DemoLabel>Sizes</DemoLabel>
        <Row>
          {BUTTON_SIZES.map((size) => (
            <MobileButton
              key={size}
              size={size}
              variant="outline"
              onPress={() => setLastAction(`size · ${size}`)}
            >
              {size}
            </MobileButton>
          ))}
        </Row>

        <Spacer size={SPACE.block} />
        <DemoLabel>Disabled, and icon-only children</DemoLabel>
        <Stack gap={SPACE.row}>
          <MobileButton
            disabled
            onPress={() => setLastAction("should never fire")}
          >
            Disabled action
          </MobileButton>
          <MobileButton
            variant="secondary"
            accessibilityLabel="Add a teammate"
            accessibilityHint="Opens the invite form"
            onPress={() => setLastAction("icon-only button")}
          >
            <ShowcaseIcon
              name="add"
              size="md"
              color={colors.secondaryForeground}
            />
          </MobileButton>
        </Stack>
      </Specimen>

      <Specimen
        title="Buttons in a row — the wrapper/surface split"
        description="A button's own style is the surface; containerStyle is the box the parent lays out. Only containerStyle can carry flex, margin or alignSelf — without it a button cannot be stretched inside a row."
        modulePath="primitive/button · containerStyle"
      >
        <Row wrap={false} gap={10}>
          <MobileButton
            variant="outline"
            containerStyle={{ flex: 1 }}
            onPress={() => setLastAction("left half")}
          >
            Left
          </MobileButton>
          <MobileButton
            variant="default"
            containerStyle={{ flex: 1 }}
            onPress={() => setLastAction("right half")}
          >
            Right
          </MobileButton>
        </Row>
      </Specimen>

      <Specimen
        title="Icon buttons"
        description="An icon-only control has no text to announce, so accessibilityLabel is a required prop rather than an optional one — that is enforced by the type, not by convention."
        modulePath="primitive/icon-button"
      >
        <Row gap={SPACE.row}>
          {ICON_VARIANTS.map((variant) => (
            <MobileIconButton
              key={variant}
              variant={variant}
              icon={
                <ShowcaseIcon
                  name="star"
                  size="md"
                  color={colors[ICON_VARIANT_FOREGROUND[variant]]}
                />
              }
              accessibilityLabel={`${variant} icon button`}
              onPress={() => setLastAction(`icon-button · ${variant}`)}
            />
          ))}
        </Row>
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.row} align="center">
          {ICON_SIZES.map((size) => (
            <MobileIconButton
              key={size}
              size={size}
              variant="outline"
              icon={<ShowcaseIcon name="share" size="md" />}
              accessibilityLabel={`${size} icon button`}
              onPress={() => setLastAction(`icon size · ${size}`)}
            />
          ))}
          <MobileIconButton
            variant="destructive"
            icon={
              <ShowcaseIcon
                name="trash"
                size="md"
                color={colors.destructiveForeground}
              />
            }
            accessibilityLabel="Delete item"
            disabled
            onPress={() => setLastAction("should never fire")}
          />
        </Row>
        <Readout label="Last action" value={lastAction} />
      </Specimen>

      <Specimen
        title="Checkboxes"
        description="The error state recolours the box only. A checkbox has nowhere to put helper text, so the message belongs to a MobileFormField — and an error on a checked box would be contradictory, so checked wins."
        modulePath="primitive/checkbox"
      >
        <Stack gap={SPACE.row}>
          <MobileCheckbox
            checked={terms}
            onCheckedChange={setTerms}
            label="Accept the terms"
            description="Required before an account can be created"
          />
          <MobileCheckbox
            checked={marketing}
            onCheckedChange={setMarketing}
            label="Product emails"
            description="At most one per month"
          />
          <MobileCheckbox
            checked={false}
            onCheckedChange={() => {}}
            label="Company size"
            description="Marked invalid, box recoloured"
            error="Select this to continue."
          />
          <MobileCheckbox
            checked
            onCheckedChange={() => {}}
            label="Already checked"
            description="checked wins over error — the box stays valid-looking"
            error="This error is ignored"
          />
          <MobileCheckbox
            checked={false}
            onCheckedChange={() => {}}
            label="Disabled"
            disabled
          />
        </Stack>
      </Specimen>

      <Specimen
        title="Switches"
        description="The native @expo/ui control — real SwiftUI Toggle on iOS, Compose Switch on Android. The toggle fires selectionAsync, not an impact."
        modulePath="primitive/switch"
      >
        <Stack gap={SPACE.block}>
          <MobileSwitch
            value={notifications}
            onValueChange={setNotifications}
            label="Push notifications"
            description="Native control via @expo/ui"
          />
          <MobileSwitch
            value={analytics}
            onValueChange={setAnalytics}
            label="Share anonymous analytics"
          />
          <MobileSwitch
            value
            onValueChange={() => {}}
            label="Locked on"
            description="Disabled"
            disabled
          />
        </Stack>
        <Readout
          label="notifications / analytics"
          value={`${notifications ? "on" : "off"} / ${analytics ? "on" : "off"}`}
        />
      </Specimen>

      <Specimen
        title="Sliders"
        description="Built on PanResponder rather than a native module, so the package keeps its zero-new-dependency rule. onSlidingComplete is the commit — that is where a network call belongs."
        modulePath="primitive/slider"
      >
        <DemoLabel>Volume</DemoLabel>
        <MobileSlider
          value={volume}
          onValueChange={setVolume}
          min={0}
          max={100}
          accessibilityLabel="Volume"
        />
        <Spacer size={SPACE.row} />
        <DemoLabel>Stepped (0–100, step 20)</DemoLabel>
        <MobileSlider
          value={steppedVolume}
          onValueChange={setSteppedVolume}
          min={0}
          max={100}
          step={20}
          accessibilityLabel="Stepped volume"
        />
        <Spacer size={SPACE.row} />
        <DemoLabel>Disabled</DemoLabel>
        <MobileSlider
          value={60}
          min={0}
          max={100}
          disabled
          accessibilityLabel="Disabled volume"
        />
        <Readout
          label="value"
          value={`${volume.toFixed(0)} / ${steppedVolume.toFixed(0)}`}
        />
      </Specimen>

      <Specimen
        title="Radio groups"
        description="Descriptions are optional per option, and a single disabled option does not disable the group."
        modulePath="primitive/radio-group"
      >
        <MobileRadioGroup
          options={PLAN_OPTIONS}
          value={plan}
          onValueChange={setPlan}
        />
        <Readout label="Selected plan" value={plan} />
        <Spacer size={SPACE.row} />
        <DemoLabel>Whole group disabled</DemoLabel>
        <MobileRadioGroup options={PLAN_OPTIONS} value="starter" disabled />
        <Readout label="Scheme in context" value={ctx.scheme} />
      </Specimen>

      <Specimen
        title="Chips"
        description="A pill whose selected state crossfades to the primary fill via stacked layers — the label colour swaps without ever interpolating colour strings. Omit onPress and it renders as a static tag."
        modulePath="primitive/chip"
      >
        <Row gap={SPACE.label}>
          <MobileChip label="Static" />
          <MobileChip
            label={chipSelected ? "Following" : "Follow"}
            selected={chipSelected}
            onPress={() => setChipSelected((current) => !current)}
          />
          <MobileChip
            label="Starred"
            selected
            icon={
              <ShowcaseIcon
                name="star"
                size="sm"
                color={colors.primaryForeground}
              />
            }
            onPress={() => setLastAction("chip · starred")}
          />
          <MobileChip label="Disabled" disabled onPress={() => {}} />
        </Row>
        <Readout
          label="Follow chip"
          value={chipSelected ? "selected" : "off"}
        />
      </Specimen>

      <Specimen
        title="Toggle groups"
        description="A pill row built on MobileChip, so the fill crossfade and the 44pt hit slop come for free. Single mode replaces the value like a radio group; multiple mode toggles membership and emits an array — tapping a selected pill removes it."
        modulePath="primitive/toggle-group"
      >
        <DemoLabel>Single — sort order</DemoLabel>
        <MobileToggleGroup
          options={SORT_OPTIONS}
          value={sortMode}
          onChange={(next) => setSortMode(next as string)}
        />
        <Spacer size={SPACE.block} />
        <DemoLabel>Multiple — issue tags</DemoLabel>
        <MobileToggleGroup
          options={TAG_OPTIONS}
          value={tags}
          multiple
          onChange={(next) => setTags(next as string[])}
        />
        <Readout
          label="sort / tags"
          value={`${sortMode} / ${tags.length > 0 ? tags.join(", ") : "—"}`}
        />
      </Specimen>

      <Specimen
        title="Ratings"
        description="Stars drawn with unicode ★/☆ glyphs — a star is one character, so there is no reason to pull in an icon dependency. The row springs a small pop whenever the displayed value changes, so the commit is felt. readOnly removes the tap targets entirely."
        modulePath="primitive/rating"
      >
        <DemoLabel>Controlled</DemoLabel>
        <MobileRating value={rating} onChange={setRating} />
        <Spacer size={SPACE.row} />
        <DemoLabel>Read-only display — 4.4 rounds to 4 filled stars</DemoLabel>
        <MobileRating value={4.4} readOnly size={20} />
        <Readout label="Your rating" value={`${rating} / 5`} />
      </Specimen>

      <Specimen
        title="Stepper"
        description="A − value + quantity row in tabular numerals, so digits do not jitter mid-press. Buttons disable exactly at the bounds, and every committed step fires a selection tick."
        modulePath="primitive/stepper"
      >
        <DemoLabel>Quantity — clamped 0–10</DemoLabel>
        <MobileStepper
          value={quantity}
          onChange={setQuantity}
          min={0}
          max={10}
        />
        <Readout label="quantity" value={String(quantity)} />
      </Specimen>

      <Specimen
        title="Swatches"
        description="Round colour-picking chips. The selection ring sits in a constant-size transparent border slot, so picking a new colour never nudges its neighbours — and the chip pops with a spring on the way in."
        modulePath="primitive/swatch"
      >
        <Row gap={SPACE.inline}>
          {SWATCH_COLORS.map((candidate) => (
            <MobileSwatch
              key={candidate.name}
              color={candidate.color}
              selected={swatch === candidate.name}
              accessibilityLabel={candidate.name}
              onPress={() => setSwatch(candidate.name)}
            />
          ))}
        </Row>
        <Readout label="Picked colour" value={`${swatch} · ${swatchColor}`} />
      </Specimen>

      <Specimen
        title="Floating action buttons"
        description="A 56pt primary-filled circle carrying the same hard 2pt bottom edge as MobileButton — the press slides the surface down over it. With a label the FAB extends into the Material pill shape. Positioning is the caller's job."
        modulePath="primitive/fab"
      >
        <Row gap={SPACE.block} align="flex-start">
          <MobileFab
            icon={
              <ShowcaseIcon
                name="add"
                size="lg"
                color={colors.primaryForeground}
              />
            }
            accessibilityLabel="New note"
            onPress={() => setLastAction("fab · icon-only")}
          />
          <MobileFab
            icon={
              <ShowcaseIcon
                name="capture"
                size="md"
                color={colors.primaryForeground}
              />
            }
            label="Compose"
            onPress={() => setLastAction("fab · extended")}
          />
        </Row>
      </Specimen>

      <Specimen
        title="Speed dial"
        description="A FAB that fans out into labelled action circles: staggered in nearest-first so the fan reads as a sequence, folding back outermost-first, with the + glyph rotating 45° into an × off the same open value. Picking an action closes the dial."
        modulePath="composite/speed-dial"
      >
        {/* The fan is absolutely positioned above the FAB, so the specimen
            reserves the room it opens into. The box has to be at least the
            fan's own height, because `MobileCard` clips its overflow:
              FAB 56 + STACK_OFFSET 72 + (3 actions × 40 + 2 gaps × 12) = 216.
            232 leaves 16pt of air above the top action. */}
        <View style={{ minHeight: 232, justifyContent: "flex-end" }}>
          <MobileSpeedDial actions={DIAL_ACTIONS} />
        </View>
      </Specimen>

      <Specimen
        title="Pressable scale"
        description="The reusable press wrapper every tappable surface should compose: a spring shrink on press-in, an automatic hit-slop pad up to the 44pt floor, and the whole animation on the native driver. Wrap anything in it and it becomes tappable."
        modulePath="primitive/pressable-scale"
      >
        <MobilePressableScale
          onPress={() => setLastAction("pressable surface")}
          accessibilityLabel="Now playing card"
        >
          <View
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 2,
            }}
          >
            <MobileText variant="bodyMedium">
              Now playing — Midnight Ferry
            </MobileText>
            <MobileText variant="caption" color="muted">
              Press anywhere on this surface
            </MobileText>
          </View>
        </MobilePressableScale>
        <Readout label="Last action" value={lastAction} />
      </Specimen>

      <Specimen
        title="Menus"
        description="Trigger plus an absolutely-positioned panel. There is no outside-press dismissal, by design — an invisible full-screen responder would swallow taps on whatever sits behind. Item presses tick, close the panel, then fire."
        modulePath="primitive/menu"
      >
        {/* The panel is absolutely positioned below the trigger and clipped by
            the card, so the box reserves its full drop: trigger 32 + margin 4 +
            panel (padding 8 + 4 items × 44) = 220. */}
        <View style={{ minHeight: 224 }}>
          <Row gap={SPACE.row} align="flex-start">
            <MobileMenu items={MENU_ITEMS} />
            <MobileMenu
              align="right"
              trigger={
                // A custom trigger mirrors the library's own default trigger:
                // 32pt surface, `radius.sm`, `paddingHorizontal` 10. It clears
                // the 44pt floor through the wrapper's own 8pt hit slop, not by
                // growing the visible control — the same split `MobileButton`
                // uses, and the reason a trigger can stay this short.
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    minHeight: 32,
                    paddingHorizontal: 10,
                    borderRadius: metrics.radius.sm,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <ShowcaseIcon name="settings" size="sm" />
                  <MobileText variant="callout">Project settings</MobileText>
                </View>
              }
              items={MENU_ITEMS}
            />
          </Row>
        </View>
      </Specimen>
    </View>
  )
}
