import * as React from "react"
import { View } from "react-native"
import {
  MobileAspectRatio,
  MobileAvatar,
  MobileBadge,
  MobileBanner,
  MobileButton,
  MobileCallout,
  MobileChartBar,
  MobileChartLine,
  MobileChartPie,
  MobileCopyableText,
  MobileDividerText,
  MobileExpandableText,
  MobileGrid,
  MobileImage,
  MobileLabel,
  MobileLink,
  MobileProgress,
  MobileProgressRing,
  MobileSeparator,
  MobileSkeleton,
  MobileSkeletonCard,
  MobileSkeletonList,
  MobileSkeletonProfile,
  MobileSparkline,
  MobileSpacer,
  MobileSpinner,
  MobileStack,
  MobileStatusDot,
  MobileSurface,
  MobileTag,
  MobileText,
  MobileZStack,
  useMobileTheme,
  type ColorRamp,
  type MobileAvatarSize,
  type MobileBadgeVariant,
  type MobileStatusDotTone,
  type MobileSurfaceVariant,
  type MobileTagTone,
  type MobileTextVariant,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon } from "../icons"
import {
  DemoLabel,
  Readout,
  Row,
  SPACE,
  Spacer,
  Specimen,
  Stack,
  Swatch,
} from "../ui"
import {
  ADA,
  KATHERINE,
  REVENUE_VS_COSTS,
  SESSIONS_BY_DEVICE,
  SIGNUPS_BY_CHANNEL,
  STATUS_TONES,
  WEEKLY_ACTIVE_USERS,
} from "../sample-data"

/**
 * Foundations — the generic display modules.
 *
 * `text`, `badge`, `avatar`, `separator`, `divider-text`, `skeleton` (plus the
 * skeleton composites), `spinner`, `progress`, `progress-ring`, `label`,
 * `link`, `surface`, `stack`, `spacer`, `grid`, `aspect-ratio`, `image`,
 * `status-dot`, `tag`, `expandable-text`, `copyable-text`, `sparkline`,
 * `callout`, `banner` and the chart family.
 *
 * These are the modules with no navigation of their own; they exist to be
 * composed by everything else.
 */

const TYPE_RAMP: { variant: MobileTextVariant; label: string; size: string }[] =
  [
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

const SURFACE_VARIANTS: MobileSurfaceVariant[] = [
  "background",
  "surface",
  "card",
  "muted",
]

const DOT_TONES: MobileStatusDotTone[] = [
  "success",
  "warning",
  "destructive",
  "info",
  "muted",
]

const TAG_TONES: MobileTagTone[] = [
  "muted",
  "primary",
  "success",
  "warning",
  "destructive",
  "info",
]

export function FoundationsSection({ ctx }: { ctx: ShowcaseContext }) {
  const { colors } = useMobileTheme()
  const [counter, setCounter] = React.useState(42)
  const [progress, setProgress] = React.useState(0.35)
  const [linkTaps, setLinkTaps] = React.useState(0)
  const [removedTags, setRemovedTags] = React.useState<string[]>([])
  const [copies, setCopies] = React.useState(0)
  const [bannerDismissed, setBannerDismissed] = React.useState(false)

  const stepProgress = (delta: number) =>
    setProgress((current) => Math.min(1, Math.max(0, current + delta)))

  return (
    <View>
      <Specimen
        title="Type scale"
        description="Proportional line-heights with a 16px floor for anything the user types. Tabular numerals are opt-in per node, because they widen every glyph."
        modulePath="primitive/text"
      >
        <Stack gap={SPACE.label}>
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

        <Spacer size={SPACE.block} />
        <DemoLabel>Proportional vs tabular</DemoLabel>
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

        <Spacer size={SPACE.row} />
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
        <Spacer size={SPACE.row} />
        <Row>
          <MobileBadge variant="destructive" tabular>
            {counter.toString()}
          </MobileBadge>
          <MobileBadge variant="success" tabular>
            {`+${counter.toString()}%`}
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
        <Row gap={SPACE.row}>
          {AVATAR_SIZES.map((size) => (
            <MobileAvatar key={size} size={size} initials={ADA.initials} />
          ))}
        </Row>
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.row}>
          <MobileAvatar initials={ADA.name} />
          <MobileAvatar initials="" />
          <MobileAvatar fallback={<ShowcaseIcon name="person" size="md" />} />
          <MobileAvatar
            initials={KATHERINE.initials}
            accessibilityLabel={`Profile for ${KATHERINE.name}`}
          />
        </Row>
      </Specimen>

      <Specimen
        title="Separators"
        description="Horizontal, labelled, vertical inside a row, and the hairline–label–hairline divider for soft form breaks."
        modulePath="primitive/separator · primitive/divider-text"
      >
        <MobileSeparator />
        <Spacer size={SPACE.row} />
        <MobileSeparator label="Section break" />
        <Spacer size={SPACE.row} />
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
        <Spacer size={SPACE.row} />
        <MobileDividerText label="or continue with" />
      </Specimen>

      <Specimen
        title="Loading surfaces"
        description="Skeleton, spinner, progress and the ring. Progress takes a 0–1 value and clamps it, so a caller cannot overflow the track — the ring does the same. The skeleton composites are pre-assembled placeholders for the three shapes every app loads: a list, a card and a profile."
        modulePath="primitive/skeleton · primitive/spinner · primitive/progress · primitive/progress-ring · composite/skeleton-list · composite/skeleton-card · composite/skeleton-profile"
      >
        <Stack gap={SPACE.row}>
          <MobileSkeleton width="70%" height={16} />
          <MobileSkeleton width="45%" height={16} />
          <MobileSkeleton width={120} height={72} radius={14} />
        </Stack>

        <Spacer size={SPACE.block} />
        <Row gap={SPACE.block}>
          <MobileSpinner size="small" />
          <MobileSpinner size="large" />
          <MobileSpinner size="large" color="success" />
          <MobileSpinner size="large" color="destructive" />
        </Row>

        <Spacer size={SPACE.block} />
        <MobileProgress value={progress} label="Upload" />
        <Spacer size={SPACE.row} />
        <MobileProgress value={0.6} color="success" height={10} />
        <Spacer size={SPACE.row} />
        <MobileProgress indeterminate />
        <Readout label="value" value={progress.toFixed(2)} />
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.label}>
          <MobileButton
            size="sm"
            variant="outline"
            onPress={() => stepProgress(-0.1)}
          >
            −0.10
          </MobileButton>
          <MobileButton
            size="sm"
            variant="outline"
            onPress={() => stepProgress(0.1)}
          >
            +0.10
          </MobileButton>
          <MobileButton
            size="sm"
            variant="ghost"
            onPress={() => setProgress(0.35)}
          >
            Reset
          </MobileButton>
        </Row>

        <Spacer size={SPACE.block} />
        <Row gap={SPACE.block} align="center">
          <MobileProgressRing value={0.25} size={48} />
          <MobileProgressRing
            value={progress}
            size={64}
            strokeWidth={8}
            color={colors.success}
          >
            <MobileText variant="caption" tabular>
              {`${Math.round(progress * 100)}%`}
            </MobileText>
          </MobileProgressRing>
          <MobileProgressRing
            value={0.9}
            size={48}
            strokeWidth={4}
            color={colors.info}
          />
        </Row>

        <Spacer size={SPACE.block} />
        <DemoLabel>Skeleton list (avatars, 3 rows)</DemoLabel>
        <MobileSkeletonList rows={3} avatar />

        <Spacer size={SPACE.block} />
        <DemoLabel>Skeleton card (media, 2 lines)</DemoLabel>
        <MobileSkeletonCard media lines={2} />

        <Spacer size={SPACE.block} />
        <DemoLabel>Skeleton profile</DemoLabel>
        <MobileSkeletonProfile />
      </Specimen>

      <Specimen
        title="Labels"
        description="The required marker is structural — it is appended as a mark rather than baked into the copy, so a translation cannot drop it."
        modulePath="primitive/label"
      >
        <Stack gap={SPACE.row}>
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
        <Spacer size={SPACE.row} />
        <MobileLink
          variant="standalone"
          onPress={() => setLinkTaps((n) => n + 1)}
        >
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

      <Specimen
        title="Surfaces"
        description="Four theme layers, mapped from the ramp so a screen never hardcodes a background. The card variant draws the 1px outline; the others stay flat."
        modulePath="primitive/surface"
      >
        <Stack gap={SPACE.label}>
          {SURFACE_VARIANTS.map((variant) => (
            <MobileSurface
              key={variant}
              variant={variant}
              style={{ padding: 12 }}
            >
              <MobileText variant="callout" color="muted">
                {`variant="${variant}"`}
              </MobileText>
            </MobileSurface>
          ))}
        </Stack>
      </Specimen>

      <Specimen
        title="Stacks & z-stacks"
        description="align and justify take friendly names rather than raw flexbox strings. The z-stack makes the first child the sizing base and lets later children position themselves over it — the avatar keeps its presence dot without a wrapper View."
        modulePath="primitive/stack"
      >
        <MobileStack direction="row" gap={8} align="center">
          <MobileSurface
            variant="muted"
            style={{ paddingVertical: 10, paddingHorizontal: 14 }}
          >
            <MobileText variant="caption" color="muted">
              short
            </MobileText>
          </MobileSurface>
          <MobileSurface
            variant="muted"
            style={{ paddingVertical: 20, paddingHorizontal: 14 }}
          >
            <MobileText variant="caption" color="muted">
              taller
            </MobileText>
          </MobileSurface>
          <MobileSurface
            variant="muted"
            style={{ paddingVertical: 6, paddingHorizontal: 14 }}
          >
            <MobileText variant="caption" color="muted">
              shortest
            </MobileText>
          </MobileSurface>
        </MobileStack>

        <Spacer size={SPACE.row} />
        <MobileSurface variant="muted" style={{ height: 84, padding: 12 }}>
          <MobileStack align="stretch" justify="between" style={{ flex: 1 }}>
            <MobileText variant="caption" color="muted">
              justify=&quot;between&quot;
            </MobileText>
            <MobileText variant="caption" color="muted">
              top and bottom, nothing in the middle
            </MobileText>
          </MobileStack>
        </MobileSurface>

        <Spacer size={SPACE.row} />
        <MobileZStack>
          <MobileAvatar size="xl" initials={ADA.initials} />
          <View style={{ position: "absolute", right: -2, bottom: -2 }}>
            <MobileSurface variant="card" radius={999} style={{ padding: 3 }}>
              <MobileStatusDot
                tone="success"
                size={8}
                pulse
                accessibilityLabel="Online"
              />
            </MobileSurface>
          </View>
        </MobileZStack>
      </Specimen>

      <Specimen
        title="Spacers & grids"
        description="A bare spacer is a flex filler that pushes siblings apart; a sized one is a fixed gap that works in both axes. The grid chunks children into equal rows, so a short last row keeps its cell width."
        modulePath="primitive/spacer · primitive/grid"
      >
        <MobileSurface variant="muted" style={{ padding: 12 }}>
          <MobileStack direction="row" align="center">
            <MobileText variant="callout">Left</MobileText>
            <MobileSpacer />
            <MobileText variant="callout">Pushed right</MobileText>
          </MobileStack>
          <MobileSpacer size={12} />
          <MobileStack direction="row" align="center">
            <MobileText variant="callout">A</MobileText>
            <MobileSpacer size={32} />
            <MobileText variant="callout">B — fixed 32pt</MobileText>
          </MobileStack>
        </MobileSurface>

        <Spacer size={SPACE.row} />
        <MobileGrid columns={3} gap={8}>
          {Array.from({ length: 7 }, (_, index) => (
            <MobileSurface key={index} variant="muted">
              <View style={{ alignItems: "center", paddingVertical: 14 }}>
                <MobileText variant="caption" color="muted" tabular>
                  {String(index + 1).padStart(2, "0")}
                </MobileText>
              </View>
            </MobileSurface>
          ))}
        </MobileGrid>
      </Specimen>

      <Specimen
        title="Aspect ratio & images"
        description="The ratio box derives its height from the parent's width — media tiles in one feed can never drift a pixel apart. The image frame fades in on load and swaps in a fallback node when the source fails; the second URI below is broken on purpose."
        modulePath="primitive/aspect-ratio · primitive/image"
      >
        <MobileAspectRatio ratio={16 / 9}>
          <MobileSurface
            variant="muted"
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <MobileText variant="caption" color="muted">
              16 : 9
            </MobileText>
          </MobileSurface>
        </MobileAspectRatio>
        <Spacer size={SPACE.row} />
        <MobileAspectRatio ratio={4}>
          <MobileSurface
            variant="muted"
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <MobileText variant="caption" color="muted">
              4 : 1
            </MobileText>
          </MobileSurface>
        </MobileAspectRatio>

        <Spacer size={SPACE.row} />
        <MobileImage
          source={{ uri: "https://picsum.photos/seed/celestia/400/300" }}
          ratio={4 / 3}
          accessibilityLabel="Placeholder landscape photo"
        />
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.label}>
          <MobileImage
            source={{
              uri: "https://picsum.photos/seed/celestia-round/200/200",
            }}
            ratio={1}
            radius={999}
            style={{ width: 72 }}
            accessibilityLabel="Round placeholder thumbnail"
          />
          <MobileImage
            source={{ uri: "https://celestia.invalid/missing.png" }}
            ratio={1}
            style={{ width: 72 }}
            fallback={<ShowcaseIcon name="error" size="lg" />}
            accessibilityLabel="Broken image showing its fallback"
          />
        </Row>
      </Specimen>

      <Specimen
        title="Status dots"
        description="Five tones resolved through the ramp. The pulse is a looping halo for live states — it tears itself down when the prop flips off, so a scrolling list of dots never leaks animations."
        modulePath="primitive/status-dot"
      >
        <Row gap={SPACE.block}>
          {DOT_TONES.map((tone) => (
            <Row key={tone} gap={6} wrap={false}>
              <MobileStatusDot tone={tone} accessibilityLabel={tone} />
              <MobileText variant="caption" color="muted">
                {tone}
              </MobileText>
            </Row>
          ))}
          <Row gap={SPACE.label} wrap={false}>
            <MobileStatusDot
              tone="destructive"
              pulse
              accessibilityLabel="Recording"
            />
            <MobileText variant="caption" color="muted">
              pulsing
            </MobileText>
          </Row>
        </Row>
      </Specimen>

      <Specimen
        title="Tags"
        description="Six tones for categorisation. Unlike a chip, a tag is never selectable — the only interaction is the optional dismiss, which is why the ✕ appears only where onDismiss is passed."
        modulePath="primitive/tag"
      >
        <Row>
          {TAG_TONES.filter((tone) => !removedTags.includes(tone)).map(
            (tone) => (
              <MobileTag
                key={tone}
                label={tone}
                tone={tone}
                onDismiss={() =>
                  setRemovedTags((current) => [...current, tone])
                }
              />
            )
          )}
          {removedTags.length === 0 ? (
            <MobileTag label="static — no dismiss" tone="muted" />
          ) : null}
        </Row>
        <Readout
          label="Dismissed"
          value={removedTags.length === 0 ? "none" : removedTags.join(", ")}
        />
        {removedTags.length > 0 ? (
          <>
            <Spacer size={SPACE.row} />
            <MobileButton
              size="sm"
              variant="ghost"
              onPress={() => setRemovedTags([])}
            >
              Restore tags
            </MobileButton>
          </>
        ) : null}
      </Specimen>

      <Specimen
        title="Expandable & copyable text"
        description="The More/Less toggle only appears when the text actually overflows the clamp — a short body never grows a pointless affordance. Copy fires the callback but never touches the clipboard: the host owns that dependency."
        modulePath="primitive/expandable-text · primitive/copyable-text"
      >
        <MobileExpandableText
          lines={2}
          text="Celestia's mobile library is presentational by contract. Every screen, route and network call lives in the host app; the components render props and emit callbacks. That split is what lets the same library ship into an Expo app, a brownfield native app and a web wrapper without carrying a router anyone has to agree on. This paragraph is long on purpose — the clamp needs something to cut."
        />
        <Spacer size={SPACE.row} />
        <MobileCopyableText
          text="sk-celestia-8f14e45f"
          onCopy={() => setCopies((count) => count + 1)}
        />
        <Readout label="Copy taps" value={copies.toString()} />
      </Specimen>

      <Specimen
        title="Sparklines"
        description="Shape, not scale: the series is normalised to its own min/max, so two sparklines side by side compare trend, never magnitude. The end dot marks where the series stands now."
        modulePath="composite/sparkline"
      >
        <MobileSparkline data={WEEKLY_ACTIVE_USERS} height={44} showEndPoint />
        <Spacer size={SPACE.row} />
        <MobileSparkline
          data={[...WEEKLY_ACTIVE_USERS].reverse()}
          height={44}
          color={colors.destructive}
          strokeWidth={3}
          showEndPoint
        />
      </Specimen>

      <Specimen
        title="Callouts"
        description="Four tones for inline context that belongs with the content — quieter than a banner, louder than a caption."
        modulePath="primitive/callout"
      >
        <Stack gap={SPACE.row}>
          {STATUS_TONES.map((tone) => (
            <MobileCallout key={tone} tone={tone} title={`${tone} callout`}>
              <MobileText variant="callout">
                Tone-driven accent, tinted background, no icon dependency.
              </MobileText>
            </MobileCallout>
          ))}
        </Stack>
      </Specimen>

      <Specimen
        title="Banners"
        description="The page-level sibling of the callout: an optional action slot and an optional dismiss. Both are rendered only when the props exist — a dismiss button that cannot dismiss is a lie."
        modulePath="primitive/banner"
      >
        <Stack gap={SPACE.row}>
          {STATUS_TONES.map((tone) => (
            <MobileBanner key={tone} tone={tone} title={`${tone} banner`}>
              <MobileText variant="callout">
                Persistent context for the whole screen.
              </MobileText>
            </MobileBanner>
          ))}
          {!bannerDismissed ? (
            <MobileBanner
              tone="warning"
              title="Dismissible, with an action"
              onDismiss={() => setBannerDismissed(true)}
              action={
                <MobileButton
                  size="sm"
                  variant="outline"
                  onPress={() => setCounter((value) => value + 1)}
                >
                  Retry
                </MobileButton>
              }
            >
              <MobileText variant="callout">
                The ✕ and the action slot both appear because both props were
                passed.
              </MobileText>
            </MobileBanner>
          ) : (
            <MobileButton
              size="sm"
              variant="ghost"
              onPress={() => setBannerDismissed(false)}
            >
              Restore dismissed banner
            </MobileButton>
          )}
        </Stack>
      </Specimen>

      <Specimen
        title="Charts"
        description="Bar, line and pie over small sample sets. They live here rather than in Data for now — chart-scatter has no specimen yet, and the family stays together until it does. All three drop non-finite values instead of distorting the scale."
        modulePath="composite/chart-bar · composite/chart-line · composite/chart-pie"
      >
        <DemoLabel>Bar — grouped, two series</DemoLabel>
        <MobileChartBar
          data={SIGNUPS_BY_CHANNEL}
          series={["organic", "paid"]}
          seriesLabels={{ organic: "Organic", paid: "Paid" }}
          grouped
          height={180}
          xLabel="Week"
          yLabel="Signups"
          formatValue={(value) => value.toFixed(0)}
        />

        <Spacer size={SPACE.block} />
        <DemoLabel>Line — smoothed, with area fill</DemoLabel>
        <MobileChartLine
          data={REVENUE_VS_COSTS}
          series={["revenue", "costs"]}
          seriesLabels={{ revenue: "Revenue", costs: "Costs" }}
          curve="monotoneX"
          showArea
          height={180}
          xLabel="Day"
          yLabel="$k"
          formatValue={(value) => value.toFixed(0)}
        />

        <Spacer size={SPACE.block} />
        <DemoLabel>Pie — donut with legend</DemoLabel>
        <MobileChartPie
          data={SESSIONS_BY_DEVICE}
          donut
          height={180}
          formatValue={(value) => `${value.toFixed(0)}%`}
        />
      </Specimen>
    </View>
  )
}
