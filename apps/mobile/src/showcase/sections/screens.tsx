import { View } from "react-native"
import { MobileAlert, MobileText } from "@celestia-project/mobile"
import { SCREEN_PREVIEWS } from "../screens-preview"
import type { ShowcaseContext } from "../types"
import { SPACE, Spacer, Specimen } from "../ui"

/**
 * Screens — the twenty `layout/` modules.
 *
 * These are the modules that own a whole screen, so they cannot be demonstrated
 * inside a card the way a button can: the gallery would be supplying a second
 * safe area and a second scroll view around a component whose entire job is to
 * provide both. Each one therefore opens full-screen via `ctx.openPreview()`.
 *
 * Because they cannot be demonstrated inline, each module gets a *launcher*
 * specimen rather than a content specimen — `Specimen` with `onPress` and no
 * children, which renders a header-only card behind the library's own
 * `MobilePressableScale` and marks it with a chevron.
 *
 * This replaced a single card holding twenty stacked buttons. That shape was the
 * one structural outlier in the gallery: it declared no jump-menu entries, so
 * none of the twenty screens could be jumped to, and it made the section the
 * longest scroll in the app while showing the least.
 */
export function ScreensSection({ ctx }: { ctx: ShowcaseContext }) {
  return (
    <View>
      <MobileAlert variant="info" title="Presentational by contract">
        <MobileText variant="callout">
          None of these screens fetches data, reads an auth client, or
          navigates. They take props and emit callbacks — the previews below are
          what a host app's router would wire up.
        </MobileText>
      </MobileAlert>

      <Spacer size={SPACE.block} />

      {/* Counted, never written down: a hand-typed "twenty" is the kind of copy
          that goes stale the first time a layout module is added. */}
      <MobileText variant="caption" color="muted">
        {`${SCREEN_PREVIEWS.length} modules — tap a card to open it full-screen.`}
      </MobileText>

      <Spacer size={SPACE.block} />

      {SCREEN_PREVIEWS.map((preview) => (
        <Specimen
          key={preview.key}
          title={preview.label}
          description={preview.summary}
          modulePath={preview.modulePath}
          onPress={() => ctx.openPreview(preview.key)}
        />
      ))}
    </View>
  )
}
