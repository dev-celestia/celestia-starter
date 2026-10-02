import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { twoFactor } from "better-auth/plugins"
// feature-manager:auth-imports:begin
// feature-manager:auth-imports:end

import { db } from "@workspace/db"

/**
 * Origins allowed to hit the auth endpoints. The browser normally reaches auth
 * through the frontend's /api proxy (same-origin), but OAuth redirects and any
 * direct cross-origin calls are validated against this list, so it must contain
 * the public origin(s) of the frontend. Override per environment with
 * BETTER_AUTH_TRUSTED_ORIGINS (comma-separated) — the localhost defaults below
 * must never be shipped to production.
 */
function trustedOrigins(): string[] {
  const fromEnv = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  }
  return ["http://localhost:3000", "http://localhost:1212"]
}

const secret = process.env.BETTER_AUTH_SECRET
if (!secret || secret === "replace-me" || secret.length < 32) {
  console.warn(
    "[auth] BETTER_AUTH_SECRET is missing, set to the documented placeholder, or shorter than " +
      "32 characters. Generate a real one with: openssl rand -base64 32",
  )
}

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    // Always on (Better Auth limits to production by default) and persisted in
    // the rate_limit table so limits survive restarts. Sensitive endpoints
    // (sign-in/sign-up) default to 3 attempts per 10 seconds per client IP.
    enabled: true,
    storage: "database",
  },
  // Google sign-in only registers when both credentials are present, so a
  // missing env var surfaces as "Google unavailable" instead of a runtime crash.
  ...(googleConfigured
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),
  plugins: [
    twoFactor({
      issuer: "Celestia",
    }),
    // feature-manager:auth-plugins:begin
    // feature-manager:auth-plugins:end
  ],
  trustedOrigins: trustedOrigins(),
})

export type Session = typeof auth.$Infer.Session
