import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { twoFactor } from "better-auth/plugins"
// feature-manager:auth-imports:begin
// feature-manager:auth-imports:end

import { db } from "@workspace/db"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    twoFactor({
      issuer: "Celestia",
    }),
    // feature-manager:auth-plugins:begin
    // feature-manager:auth-plugins:end
  ],
  // The browser reaches auth through the frontend proxy (http://localhost:3000).
  trustedOrigins: ["http://localhost:3000"],
})

export type Session = typeof auth.$Infer.Session
