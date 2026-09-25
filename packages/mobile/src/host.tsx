import * as React from "react"
import { useColorScheme } from "react-native"
import { Host, type UniversalHostProps } from "@expo/ui"
import { lightColors, darkColors, type ColorRamp } from "./tokens"

interface MobileThemeContextValue {
  colorScheme: "light" | "dark"
  colors: ColorRamp
}

const MobileThemeContext = React.createContext<MobileThemeContextValue>({
  colorScheme: "light",
  colors: lightColors,
})

export function useMobileTheme() {
  return React.useContext(MobileThemeContext)
}

export interface MobileHostProps extends UniversalHostProps {
  /**
   * Override the color scheme ('light' | 'dark'). Defaults to device system preference.
   */
  forcedTheme?: "light" | "dark"
}

/**
 * MobileHost
 *
 * Root container wrapper bridging React Native to native SwiftUI / Compose via @expo/ui.
 * Also provides Celestia Mobile design tokens & theme context.
 */
export function MobileHost({
  children,
  matchContents = false,
  forcedTheme,
  style,
  ...props
}: MobileHostProps) {
  const systemScheme = useColorScheme()
  const activeScheme: "light" | "dark" =
    forcedTheme ?? (systemScheme === "dark" ? "dark" : "light")
  const colors = activeScheme === "dark" ? darkColors : lightColors

  const contextValue = React.useMemo(
    () => ({ colorScheme: activeScheme, colors }),
    [activeScheme, colors]
  )

  return (
    <MobileThemeContext.Provider value={contextValue}>
      <Host matchContents={matchContents} style={style} {...props}>
        {children}
      </Host>
    </MobileThemeContext.Provider>
  )
}
