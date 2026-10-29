import * as React from "react"
import { View } from "react-native"
import {
  MobileAlert,
  MobileButton,
  MobileCard,
  MobileCardContent,
  MobileCardDescription,
  MobileCardHeader,
  MobileCardTitle,
  MobileText,
} from "@celestia-project/mobile"
import { SCREEN_PREVIEWS } from "../screens-preview"
import type { ShowcaseContext } from "../types"
import { Spacer, Stack } from "../ui"

/**
 * Screens — the ten `layout/` modules.
 *
 * These are the modules that own a whole screen, so they cannot be demonstrated
 * inside a card the way a button can: the gallery would be supplying a second
 * safe area and a second scroll view around a component whose entire job is to
 * provide both. Each one therefore opens full-screen via `ctx.openPreview()`.
 */
export function ScreensSection({ ctx }: { ctx: ShowcaseContext }) {
  return (
    <View>
      <MobileAlert variant="info" title="Presentational by contract">
        <MobileText variant="callout">
          None of these screens fetches data, reads an auth client, or navigates.
          They take props and emit callbacks — the previews below are what a host
          app's router would wire up.
        </MobileText>
      </MobileAlert>

      <Spacer size={12} />

      <MobileCard>
        <MobileCardHeader>
          <MobileCardTitle>{`${SCREEN_PREVIEWS.length} layout modules`}</MobileCardTitle>
          <MobileCardDescription>
            Tap one to open it full-screen. The gallery steps aside so the screen
            owns its own safe area, header and scrolling.
          </MobileCardDescription>
        </MobileCardHeader>
        <MobileCardContent>
          <Stack gap={16}>
            {SCREEN_PREVIEWS.map((preview) => (
              <View key={preview.key}>
                <MobileButton
                  variant="outline"
                  onPress={() => ctx.openPreview(preview.key)}
                >
                  {preview.label}
                </MobileButton>
                <MobileText
                  variant="caption"
                  color="muted"
                  style={{ marginTop: 6 }}
                >
                  {preview.summary}
                </MobileText>
                <MobileText variant="caption" color="muted">
                  {preview.modulePath}
                </MobileText>
              </View>
            ))}
          </Stack>
        </MobileCardContent>
      </MobileCard>
    </View>
  )
}
