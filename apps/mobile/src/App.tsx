import * as React from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { MobileHost, MobileToastProvider } from "@celestia-project/mobile"
import { ShowcaseRoot } from "./showcase"

/**
 * The showcase host.
 *
 * Five nested layers, each with one job:
 *
 * 1. `SafeAreaProvider` — measures the insets. Nothing below it can resolve a
 *    safe area without it.
 * 2. `MobileHost` — bridges React Native to SwiftUI / Compose and provides the
 *    design-token context. It **must** be sized: it renders `@expo/ui`'s `Host`,
 *    whose `matchContents` and `useViewportSizeMeasurement` both default to
 *    `false`, so an unsized host lays out to zero height and the screen goes
 *    blank. `forcedTheme` is what makes the toggle in the header work; without it
 *    the host follows the device.
 * 3. A sized `View` — `MobileToastProvider`'s overlay positions itself absolutely
 *    against its parent, so that parent has to be a sized box.
 * 4. `MobileToastProvider` — owns the single active toast.
 * 5. `ShowcaseRoot` — the gallery and the full-screen preview stack.
 *
 * Everything the showcase demonstrates lives in `./showcase`. This file exists
 * only to wire the providers up, which is also the answer to "how do I use this
 * package?" — the five layers above are the entire setup.
 */
export default function App() {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark")

  const toggleTheme = React.useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }, [])

  return (
    <SafeAreaProvider>
      {/* `style={{ flex: 1 }}` is load-bearing, not cosmetic. `MobileHost` renders
          `@expo/ui`'s `Host`, whose `matchContents` and `useViewportSizeMeasurement`
          both default to `false` — so with no explicit size the host lays out to
          zero height, every child collapses with it, and the only thing left on
          screen is the root view's background. That is the "white screen". */}
      <MobileHost style={styles.host} forcedTheme={theme}>
        {/* `MobileToastProvider`'s overlay positions itself absolutely against its
            parent, so that parent has to be a sized box rather than an unsized one. */}
        <View style={styles.fill}>
          <MobileToastProvider>
            <ShowcaseRoot onToggleTheme={toggleTheme} />
          </MobileToastProvider>
        </View>
      </MobileHost>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  fill: { flex: 1 },
})
