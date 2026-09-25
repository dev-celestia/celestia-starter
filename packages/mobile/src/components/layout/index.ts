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
 * NOTE: intentionally empty for now. This barrel is populated in Phase 4 of
 * `packages/mobile/PLAN.md` (screen, auth-shell, onboarding-screen,
 * sign-in-screen, sign-up-screen, forgot-password-screen,
 * reset-password-screen, otp-verify-screen, settings-screen, status-screen).
 */
