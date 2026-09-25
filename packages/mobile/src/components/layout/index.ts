/**
 * Celestia Mobile — Layout components
 *
 * Full-screen shells and screens. These own the frame — safe area, scrolling,
 * keyboard avoidance, headers, footers — and take their content through slots.
 *
 * Hard rule: layout components are **presentational**. They never fetch data,
 * never import an auth client, and never navigate. They receive props and emit
 * callbacks; the host app owns routing and data.
 *
 * The convention is a shell + thin-screen split: one shell owns the shared
 * frame, and each screen supplies only its own fields and defaults on top of it
 * — so screens that resemble each other cannot drift apart.
 *
 * - `MobileScreen` is the base frame. Everything else composes it.
 * - `MobileAuthShell` adds the logo / heading / form / aside / footer frame that
 *   every authentication screen shares.
 * - The remaining exports are screens: onboarding, sign-in, sign-up,
 *   forgot-password, reset-password, OTP verify, settings and status.
 *
 * `MobileScreen` needs a `SafeAreaProvider` above it (from
 * `react-native-safe-area-context`) for safe-area padding to resolve; without
 * one it still renders, just without the insets.
 */

export * from "./auth-shell"
export * from "./forgot-password-screen"
export * from "./onboarding-screen"
export * from "./otp-verify-screen"
export * from "./reset-password-screen"
export * from "./screen"
export * from "./settings-screen"
export * from "./sign-in-screen"
export * from "./sign-up-screen"
export * from "./status-screen"
