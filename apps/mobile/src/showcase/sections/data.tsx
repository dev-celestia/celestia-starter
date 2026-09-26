import * as React from "react"
import { View } from "react-native"
import {
  MobileAvatar,
  MobileAvatarGroup,
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileCardContent,
  MobileCardDescription,
  MobileCardFooter,
  MobileCardHeader,
  MobileCardTitle,
  MobileEmptyState,
  MobileListItem,
  MobileList,
  MobileSettingRow,
  MobileSeparator,
  MobileText,
  useMobileTheme,
  type MobileAvatarGroupItem,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon } from "../icons"
import { Readout, Row, Spacer, Specimen, Stack } from "../ui"

/**
 * Data display — the five modules that present a collection or a record.
 *
 * `list`, `card`, `avatar-group`, `setting-row`, `empty-state`.
 *
 * The dividing line between these two categories is worth knowing: `MobileList`
 * is the **native** grouped table from `@expo/ui` (a real SwiftUI `List`), while
 * `MobileSettingRow` is a plain composed row. The native list gives you platform
 * section chrome and native scrolling; the composed row gives you full control
 * and works anywhere. Reach for the native one first, and drop to the composed
 * one when you need a layout the native list will not express.
 */

const COLLABORATORS: MobileAvatarGroupItem[] = [
  { initials: "AL", accessibilityLabel: "Ada Lovelace" },
  { initials: "GH", accessibilityLabel: "Grace Hopper" },
  { initials: "KM", accessibilityLabel: "Katherine Johnson" },
  { initials: "MT", accessibilityLabel: "Margaret Hamilton" },
  { initials: "BL", accessibilityLabel: "Barbara Liskov" },
  { initials: "EW", accessibilityLabel: "Evelyn Boyd Granville" },
]

export function DataSection({ ctx }: { ctx: ShowcaseContext }) {
  const { colors } = useMobileTheme()
  const [lastRow, setLastRow] = React.useState("—")

  return (
    <View>
      <Specimen
        title="Native grouped list"
        description="This is a real SwiftUI List on iOS and a Compose list on Android, bridged through @expo/ui — not a styled ScrollView. Rows carry a light haptic tick on press by default."
        modulePath="primitive/list"
      >
        <MobileList>
          <MobileListItem
            supportingText="English (United States)"
            onPress={() => setLastRow("System language")}
          >
            System language
          </MobileListItem>
          <MobileListItem
            supportingText={
              ctx.scheme === "dark" ? "Dark theme active" : "Light theme active"
            }
            onPress={() => setLastRow("Colour theme")}
          >
            Colour theme
          </MobileListItem>
          <MobileListItem
            supportingText="Connected"
            onPress={() => setLastRow("Network status")}
          >
            Network status
          </MobileListItem>
          <MobileListItem
            supportingText="Press is wired but silent"
            hapticFeedback={false}
            onPress={() => setLastRow("No-haptic row")}
          >
            Haptics disabled
          </MobileListItem>
        </MobileList>
        <Readout label="Last row" value={lastRow} />
      </Specimen>

      <Specimen
        title="Card, in full"
        description="Header, title, description, content and footer as separate slots. A string child is rendered as type; anything else is passed through untouched, which is why the footer can hold buttons."
        modulePath="primitive/card"
      >
        <MobileCard>
          <MobileCardHeader>
            <MobileCardTitle>Workspace usage</MobileCardTitle>
            <MobileCardDescription>
              Resets on the first of the month
            </MobileCardDescription>
          </MobileCardHeader>
          <MobileCardContent>
            <Row wrap={false}>
              <MobileBadge variant="info" tabular>
                68%
              </MobileBadge>
              <MobileText variant="callout" color="muted">
                of 50 GB storage
              </MobileText>
            </Row>
          </MobileCardContent>
          <MobileCardFooter>
            <MobileButton size="sm" variant="ghost">
              Manage plan
            </MobileButton>
          </MobileCardFooter>
        </MobileCard>
      </Specimen>

      <Specimen
        title="Avatar stacks"
        description="Overflow collapses into a +N chip once the list exceeds max, so a long list of collaborators cannot push a row off screen."
        modulePath="composite/avatar-group"
      >
        <MobileAvatarGroup avatars={COLLABORATORS.slice(0, 3)} />
        <Spacer size={14} />
        <MobileAvatarGroup avatars={COLLABORATORS} max={4} />
        <Spacer size={14} />
        <MobileAvatarGroup avatars={COLLABORATORS} max={6} size="lg" />
      </Specimen>

      <Specimen
        title="Settings rows"
        description="The composed alternative to the native list. A row with an onPress shows a chevron; a row with a value and no onPress is a read-out and does not."
        modulePath="composite/setting-row"
      >
        <Stack gap={0}>
          <MobileSettingRow
            label="Profile"
            description="Name, photo, pronouns"
            leading={<MobileAvatar initials="AL" size="sm" />}
            onPress={() => setLastRow("Profile")}
          />
          <MobileSeparator />
          <MobileSettingRow
            label="Plan"
            value="Pro"
            onPress={() => setLastRow("Plan")}
          />
          <MobileSeparator />
          <MobileSettingRow label="Member since" value="March 2024" />
          <MobileSeparator />
          <MobileSettingRow
            label="Two-factor authentication"
            description="Recommended"
            trailing={<ShowcaseIcon name="check" size="sm" />}
            onPress={() => setLastRow("2FA")}
          />
          <MobileSeparator />
          <MobileSettingRow
            label="Delete workspace"
            leading={
              <ShowcaseIcon name="trash" size="sm" color={colors.destructive} />
            }
            disabled
            onPress={() => setLastRow("should never fire")}
          />
        </Stack>
      </Specimen>

      <Specimen
        title="Empty states"
        description="Title is required — an illustration with no explanation is not an empty state. The action slot takes any node, so it can hold a button or a link."
        modulePath="composite/empty-state"
      >
        <MobileEmptyState
          icon={<ShowcaseIcon name="note" size="xl" />}
          title="No projects yet"
          description="Projects group your documents, deployments and environments."
          action={
            <MobileButton size="sm" onPress={() => setLastRow("Create project")}>
              Create a project
            </MobileButton>
          }
        />
        <Spacer size={12} />
        <MobileEmptyState
          title="No results"
          description="Nothing matched that filter."
        />
      </Specimen>
    </View>
  )
}
