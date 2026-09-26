import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/plugins"
// feature-manager:client-imports:begin
// feature-manager:client-imports:end

// The frontend is a pure UI client: it talks to auth over HTTP (proxied to the
// backend in apps/api) and never imports server auth code. The Session type is
// inferred from the client itself, so it always matches what useSession returns.
export const authClient = createAuthClient({
  plugins: [
    twoFactorClient(),
    // feature-manager:client-plugins:begin
    // feature-manager:client-plugins:end
  ],
})

export const { signIn, signOut, useSession } = authClient

export type Session = NonNullable<ReturnType<typeof useSession>["data"]>
