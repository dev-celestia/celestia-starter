import * as React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { MobileHost, MobileToastProvider } from "@celestia-project/mobile"
import { ShowcaseRoot } from "./showcase"

/**
 * The showcase host.
 *
 * Four nested layers, each with one job:
 *
 * 1. `SafeAreaProvider` — measures the insets. Nothing below it can resolve a
 *    safe area without it.
 * 2. `MobileHost` — bridges React Native to SwiftUI / Compose and provides the
 *    design-token context. `forcedTheme` is what makes the toggle in the header
 *    work; without it the host follows the device.
 * 3. `MobileToastProvider` — owns the single active toast. It has to sit inside
 *    a full-screen container, because its overlay positions itself absolutely
 *    against its parent.
 * 4. `ShowcaseRoot` — the gallery and the full-screen preview stack.
 *
 * Everything the showcase demonstrates lives in `./showcase`. This file exists
 * only to wire the providers up, which is also the answer to "how do I use this
 * package?" — the four layers above are the entire setup.
 */
export default function App() {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark")

  const toggleTheme = React.useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }, [])

  return (
    <SafeAreaProvider>
      <MobileHost forcedTheme={theme}>
        <MobileToastProvider>
          <ShowcaseRoot onToggleTheme={toggleTheme} />
        </MobileToastProvider>
      </MobileHost>
    </SafeAreaProvider>
  )
}
