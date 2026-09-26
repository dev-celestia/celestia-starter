import * as React from "react"
import { View } from "react-native"
import {
  MobileAvatar,
  MobileBadge,
  MobileButton,
  MobileLabel,
  MobileLink,
  MobileProgress,
  MobileSeparator,
  MobileSkeleton,
  MobileSpinner,
  MobileText,
  useMobileTheme,
  type ColorRamp,
  type MobileAvatarSize,
  type MobileBadgeVariant,
  type MobileTextVariant,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon } from "../icons"
import { Readout, Row, Spacer, Specimen, Stack, Swatch } from "../ui"

/**
 * Foundations — the nine generic display modules.
 *
 * `text`, `badge`, `avatar`, `separator`, `skeleton`, `spinner`, `progress`,
 * `label`, `link`.
 *
 * These are the modules with no interaction of their own; they exist to be
 * composed by everything else.
 */

const TYPE_RAMP: { variant: MobileTextVariant; label: string; size: string }[] = [
  { variant: "display", label: "Display", size: "32 / 38" },
  { variant: "heading", label: "Heading", size: "24 / 30" },
  { variant: "title", label: "Title", size: "19 / 24" },
  { variant: "body", label: "Body", size: "16 / 23" },
  { variant: "bodyMedium", label: "Body medium", size: "16 / 23" },
  { variant: "callout", label: "Callout", size: "14 / 18" },
  { variant: "caption", label: "Caption", size: "12 / 16" },
  { variant: "label", label: "Label", size: "11 / 14" },
]

const BADGE_VARIANTS: MobileBadgeVariant[] = [
  "default",
  "secondary",
  "success",
  "warning",
  "info",
  "destructive",
  "outline",
]

const AVATAR_SIZES: MobileAvatarSize[] = ["sm", "md", "lg", "xl"]

/**
 * Deliberately a subset of the ramp rather than all 23 tokens — a wall of
 * near-identical chips teaches nothing. The four status colours and the four
 * surface colours are the ones a screen actually reaches for.
 */
const COLOR_TOKENS: (keyof ColorRamp)[] = [
  "background",
  "surface",
  "card",
  "foreground",
  "muted",
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
  "border",
  "inputBorder",
]

export function FoundationsSection({ ctx }: { ctx: ShowcaseContext }) {
  const { colors } = useMobileTheme()
  const [counter, setCounter] = React.useState(42)
  const [progress, setProgress] = React.useState(0.35)
  const [linkTaps, setLinkTaps] = React.useState(0)

  const stepProgress = (delta: number) =>
    setProgress((current) => Math.min(1, Math.max(0, current + delta)))

  return (
    <View>
      <Specimen
        title="Type scale"
        description="Proportional line-heights with a 16px floor for anything the user types. Tabular numerals are opt-in per node, because they widen every glyph."
        modulePath="primitive/text"
      >
        <Stack gap={6}>
          {TYPE_RAMP.map((step) => (
            <Row key={step.variant} wrap={false} align="flex-start">
              <View style={{ width: 96 }}>
                <MobileText variant="caption" color="muted">
                  {step.size}
                </MobileText>
              </View>
              <MobileText variant={step.variant} style={{ flex: 1 }}>
                {step.label}
              </MobileText>
            </Row>
          ))}
        </Stack>

        <Spacer size={16} />
        <MobileText variant="caption" color="muted">
          Proportional vs tabular
        </MobileText>
        <Spacer size={6} />
        <Row wrap={false} gap={16}>
          <MobileText variant="heading">1111111</MobileText>
          <MobileText variant="heading" tabular>
            1111111
          </MobileText>
        </Row>
        <Readout
          label="Active scheme"
          value={ctx.scheme === "dark" ? "dark" : "light"}
        />

        <Spacer size={12} />
        <Row wrap={false}>
          <MobileText variant="bodyMedium">Dynamic counter</MobileText>
          <MobileBadge variant="info" tabular>
            {counter.toString()}
          </MobileBadge>
          <MobileButton
            size="sm"
            variant="outline"
            onPress={() => setCounter((value) => value + 1)}
          >
            +1 tick
          </MobileButton>
        </Row>
      </Specimen>

      <Specimen
        title="Semantic colour"
        description="Every chip below is read from the theme context at render time — nothing in this app hardcodes a hex value."
        modulePath="tokens · useMobileTheme()"
      >
        <Row>
          {COLOR_TOKENS.map((token) => (
            <Swatch key={token} token={token} value={colors[token]} />
          ))}
        </Row>
      </Specimen>

      <Specimen
        title="Badges"
        description="Seven variants plus the tabular flag for counts that change."
        modulePath="primitive/badge"
      >
        <Row>
          {BADGE_VARIANTS.map((variant) => (
            <MobileBadge key={variant} variant={variant}>
              {variant}
            </MobileBadge>
          ))}
        </Row>
        <Spacer size={10} />
        <Row>
          <MobileBadge variant="destructive" tabular>
            {counter.toString()}
          </MobileBadge>
          <MobileBadge variant="success" tabular>
            +{counter.toString()}%
          </MobileBadge>
          <MobileBadge variant="outline" tabular>
            {(counter / 100).toFixed(2)}
          </MobileBadge>
        </Row>
      </Specimen>

      <Specimen
        title="Avatars"
        description="Initials are trimmed to two characters and upper-cased. A source image wins over initials, and a custom fallback node wins over both."
        modulePath="primitive/avatar"
      >
        <Row gap={12}>
          {AVATAR_SIZES.map((size) => (
            <MobileAvatar key={size} size={size} initials="cs" />
          ))}
        </Row>
        <Spacer size={14} />
        <Row gap={12}>
          <MobileAvatar initials="Ada Lovelace" />
          <MobileAvatar initials="" />
          <MobileAvatar fallback={<ShowcaseIcon name="person" size="md" />} />
          <MobileAvatar
            initials="WL"
            accessibilityLabel="Profile for Wang Lei"
          />
        </Row>
      </Specimen>

      <Specimen
        title="Separators"
        description="Horizontal, labelled, and vertical inside a row."
        modulePath="primitive/separator"
      >
        <MobileSeparator />
        <Spacer size={12} />
        <MobileSeparator label="Section break" />
        <Spacer size={12} />
        <Row wrap={false} gap={12} align="center">
          <MobileText variant="callout">Left</MobileText>
          <View style={{ height: 28 }}>
            <MobileSeparator orientation="vertical" />
          </View>
          <MobileText variant="callout">Middle</MobileText>
          <View style={{ height: 28 }}>
            <MobileSeparator orientation="vertical" />
          </View>
          <MobileText variant="callout">Right</MobileText>
        </Row>
      </Specimen>

      <Specimen
        title="Loading surfaces"
        description="Skeleton, spinner and progress. Progress takes a 0–1 value and clamps it, so a caller cannot overflow the track."
        modulePath="primitive/skeleton · primitive/spinner · primitive/progress"
      >
        <Stack gap={10}>
          <MobileSkeleton width="70%" height={16} />
          <MobileSkeleton width="45%" height={16} />
          <MobileSkeleton width={120} height={72} radius={14} />
        </Stack>

        <Spacer size={16} />
        <Row gap={16}>
          <MobileSpinner size="small" />
          <MobileSpinner size="large" />
          <MobileSpinner size="large" color="success" />
          <MobileSpinner size="large" color="destructive" />
        </Row>

        <Spacer size={16} />
        <MobileProgress value={progress} label="Upload" />
        <Spacer size={12} />
        <MobileProgress value={0.6} color="success" height={10} />
        <Spacer size={12} />
        <MobileProgress indeterminate />
        <Readout label="value" value={progress.toFixed(2)} />
        <Spacer size={10} />
        <Row gap={8}>
          <MobileButton size="sm" variant="outline" onPress={() => stepProgress(-0.1)}>
            −0.10
          </MobileButton>
          <MobileButton size="sm" variant="outline" onPress={() => stepProgress(0.1)}>
            +0.10
          </MobileButton>
          <MobileButton size="sm" variant="ghost" onPress={() => setProgress(0.35)}>
            Reset
          </MobileButton>
        </Row>
      </Specimen>

      <Specimen
        title="Labels"
        description="The required marker is structural — it is appended as a mark rather than baked into the copy, so a translation cannot drop it."
        modulePath="primitive/label"
      >
        <Stack gap={10}>
          <MobileLabel>Email address</MobileLabel>
          <MobileLabel required>Password</MobileLabel>
          <MobileLabel required disabled>
            Workspace slug
          </MobileLabel>
        </Stack>
      </Specimen>

      <Specimen
        title="Links"
        description="Inline sits in a paragraph; standalone is a full-width tappable row. Both are real buttons, so both are reachable with a screen reader."
        modulePath="primitive/link"
      >
        <MobileText variant="body">
          By continuing you agree to the{" "}
          <MobileLink onPress={() => setLinkTaps((n) => n + 1)}>
            terms of service
          </MobileLink>{" "}
          and the{" "}
          <MobileLink onPress={() => setLinkTaps((n) => n + 1)}>
            privacy policy
          </MobileLink>
          .
        </MobileText>
        <Spacer size={12} />
        <MobileLink variant="standalone" onPress={() => setLinkTaps((n) => n + 1)}>
          Open account settings
        </MobileLink>
        <MobileLink
          variant="standalone"
          disabled
          onPress={() => setLinkTaps((n) => n + 1)}
        >
          Archived workspace (unavailable)
        </MobileLink>
        <Readout label="Inline link taps" value={linkTaps.toString()} />
      </Specimen>
    </View>
  )
}
