import { Hono } from "hono"
import { cors } from "hono/cors"

import { auth } from "./auth"
// feature-manager:imports:begin
// feature-manager:imports:blog:begin
import { blogRoutes } from "./features/blog/routes"
// feature-manager:imports:blog:end
// feature-manager:imports:access:begin
import { accessRoutes } from "./features/access/routes"
// feature-manager:imports:access:end
// feature-manager:imports:end

const app = new Hono()
  .use(
    "*",
    cors({
      // Override per environment with CORS_ORIGIN (comma-separated list).
      // The localhost default must never be shipped to production.
      origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
      credentials: true,
    })
  )
  .get("/api/health", (c) => c.json({ status: "ok" }))
  // feature-manager:routes:begin
  // feature-manager:routes:blog:begin
  .route("/", blogRoutes)
  // feature-manager:routes:blog:end
  // feature-manager:routes:access:begin
  .route("/", accessRoutes)
  // feature-manager:routes:access:end
  // feature-manager:routes:end

// Better Auth catch-all handler. Registered at runtime but intentionally kept
// out of the RPC type contract below — the frontend talks to auth through the
// Better Auth client, not the Hono RPC client.
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))

export type AppType = typeof app
export default app
