import { Platform } from "react-native"

/**
 * Monospace family for AI output surfaces — code blocks, JSON arguments, tool
 * results.
 *
 * The design system declares no mono role: `tokens.ts` mirrors the web ramp and
 * the web ramp has no `font-mono`, so promoting this to a token would put the
 * two out of step. It is scoped to `components/ai/` instead, and is the only
 * place in the package that names a font family.
 *
 * `Menlo` ships with iOS. Android's generic `monospace` resolves to Roboto Mono
 * on every current device. The web fallback is the CSS generic, which the
 * browser maps to its own mono face.
 */
export const mobileMonoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
}) as string
