import * as React from "react"
import { View } from "react-native"
import {
  MobileButton,
  MobileCheckbox,
  MobileIconButton,
  MobileRadioGroup,
  MobileSlider,
  MobileSwitch,
  MobileText,
  type MobileButtonSize,
  type MobileButtonVariant,
  type MobileIconButtonSize,
  type MobileIconButtonVariant,
  type MobileRadioOption,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { Glyph, Readout, Row, Spacer, Specimen, Stack } from "../ui"

/**
 * Actions — the six modules whose whole job is to accept a gesture.
 *
 * `button`, `icon-button`, `checkbox`, `switch`, `slider`, `radio-group`.
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

const PLAN_OPTIONS: MobileRadioOption[] = [
  {
    value: "free",
    label: "Free",
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

export function ActionsSection({ ctx }: { ctx: ShowcaseContext }) {
  const [lastAction, setLastAction] = React.useState("—")
  const [terms, setTerms] = React.useState(true)
  const [marketing, setMarketing] = React.useState(false)
  const [notifications, setNotifications] = React.useState(true)
  const [analytics, setAnalytics] = React.useState(false)
  const [volume, setVolume] = React.useState(40)
  const [plan, setPlan] = React.useState("pro")

  return (
    <View>
      <Specimen
        title="Buttons"
        description="Five variants at the default size. The press-scale is 0.97 and the haptic fires on the commit frame, not on release."
        modulePath="primitive/button"
      >
        <Stack gap={10}>
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

        <Spacer size={16} />
        <MobileText variant="caption" color="muted">
          Sizes
        </MobileText>
        <Spacer size={8} />
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

        <Spacer size={16} />
        <MobileText variant="caption" color="muted">
          Disabled, and icon-only children
        </MobileText>
        <Spacer size={8} />
        <Stack gap={10}>
          <MobileButton disabled onPress={() => setLastAction("should never fire")}>
            Disabled action
          </MobileButton>
          <MobileButton
            variant="secondary"
            accessibilityLabel="Add a teammate"
            accessibilityHint="Opens the invite form"
            onPress={() => setLastAction("icon-only button")}
          >
            <Glyph glyph="＋" />
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
        <Row gap={12}>
          {ICON_VARIANTS.map((variant) => (
            <MobileIconButton
              key={variant}
              variant={variant}
              icon={<Glyph glyph="★" />}
              accessibilityLabel={`${variant} icon button`}
              onPress={() => setLastAction(`icon-button · ${variant}`)}
            />
          ))}
        </Row>
        <Spacer size={14} />
        <Row gap={12} align="center">
          {ICON_SIZES.map((size) => (
            <MobileIconButton
              key={size}
              size={size}
              variant="outline"
              icon={<Glyph glyph="◎" />}
              accessibilityLabel={`${size} icon button`}
              onPress={() => setLastAction(`icon size · ${size}`)}
            />
          ))}
          <MobileIconButton
            variant="destructive"
            icon={<Glyph glyph="⌫" />}
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
        <Stack gap={14}>
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
        <Stack gap={16}>
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
        <MobileText variant="bodyMedium">Volume</MobileText>
        <MobileSlider
          value={volume}
          onValueChange={setVolume}
          accessibilityLabel="Volume"
        />
        <MobileText variant="bodyMedium">Stepped (0–10, step 2)</MobileText>
        <MobileSlider
          value={volume}
          onValueChange={setVolume}
          min={0}
          max={100}
          step={20}
          accessibilityLabel="Stepped volume"
        />
        <MobileText variant="bodyMedium">Disabled</MobileText>
        <MobileSlider value={60} disabled accessibilityLabel="Disabled volume" />
        <Readout label="value" value={volume.toFixed(0)} />
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
        <Spacer size={14} />
        <MobileText variant="caption" color="muted">
          Whole group disabled
        </MobileText>
        <Spacer size={8} />
        <MobileRadioGroup options={PLAN_OPTIONS} value="free" disabled />
        <Readout label="Scheme in context" value={ctx.scheme} />
      </Specimen>
    </View>
  )
}
