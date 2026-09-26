import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { z } from "zod"

import { db, user } from "@workspace/db"

import { auth } from "../../auth"

import { authorize, recordAudit, requirePermission, type AccessEnv } from "./access"

const listQuerySchema = z.object({
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

const setRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
})

const banSchema = z.object({
  banReason: z.string().max(200).optional(),
})

/** Resolve the Better Auth error message from a thrown APIError. */
function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Request failed"
}

/** Best-effort client IP for audit entries (first hop of x-forwarded-for). */
function clientIp(headers: Headers): string | null {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

/**
 * Admin user-management routes. Every route is guarded twice:
 * 1. RBAC — `requirePermission` checks the caller's role against the
 *    permission map (see ./access.ts).
 * 2. ABAC — `authorize` applies attribute-based policies against the target
 *    user (no self-demotion, no acting on other admins).
 */
export const accessRoutes = new Hono<AccessEnv>()
  // List users with search + pagination
  .get(
    "/api/admin/users",
    requirePermission("users:list"),
    zValidator("query", listQuerySchema),
    async (c) => {
      const { search, page, limit } = c.req.valid("query")
      try {
        const data = await auth.api.listUsers({
          headers: c.req.raw.headers,
          query: {
            ...(search
              ? { searchValue: search, searchOperator: "contains" as const }
              : {}),
            limit,
            offset: (page - 1) * limit,
            sortBy: "createdAt",
            sortDirection: "desc" as const,
          },
        })
        return c.json(data)
      } catch (err) {
        return c.json({ error: errorMessage(err) }, 400)
      }
    }
  )
  // Change a user's role
  .patch(
    "/api/admin/users/:id/role",
    requirePermission("users:set-role"),
    zValidator("json", setRoleSchema),
    async (c) => {
      const session = c.get("session")
      const id = c.req.param("id")
      const [target] = await db.select().from(user).where(eq(user.id, id))
      if (!target) {
        return c.json({ error: "Not found" }, 404)
      }
      if (!authorize("users:set-role", { actor: session.user, target })) {
        return c.json({ error: "Forbidden" }, 403)
      }
      try {
        const data = c.req.valid("json")
        const updated = await auth.api.setRole({
          headers: c.req.raw.headers,
          body: { userId: id, role: data.role },
        })
        await recordAudit({
          actorId: session.user.id,
          action: "users:set-role",
          targetId: id,
          details: `role: ${target.role ?? "user"} -> ${data.role}`,
          ipAddress: clientIp(c.req.raw.headers),
        })
        return c.json(updated)
      } catch (err) {
        return c.json({ error: errorMessage(err) }, 400)
      }
    }
  )
  // Ban a user (revokes their sessions)
  .post(
    "/api/admin/users/:id/ban",
    requirePermission("users:ban"),
    zValidator("json", banSchema),
    async (c) => {
      const session = c.get("session")
      const id = c.req.param("id")
      const [target] = await db.select().from(user).where(eq(user.id, id))
      if (!target) {
        return c.json({ error: "Not found" }, 404)
      }
      if (!authorize("users:ban", { actor: session.user, target })) {
        return c.json({ error: "Forbidden" }, 403)
      }
      try {
        const data = c.req.valid("json")
        const updated = await auth.api.banUser({
          headers: c.req.raw.headers,
          body: { userId: id, banReason: data.banReason },
        })
        await recordAudit({
          actorId: session.user.id,
          action: "users:ban",
          targetId: id,
          details: data.banReason ?? null,
          ipAddress: clientIp(c.req.raw.headers),
        })
        return c.json(updated)
      } catch (err) {
        return c.json({ error: errorMessage(err) }, 400)
      }
    }
  )
  // Lift a ban
  .post("/api/admin/users/:id/unban", requirePermission("users:unban"), async (c) => {
    const session = c.get("session")
    const id = c.req.param("id")
    try {
      const updated = await auth.api.unbanUser({
        headers: c.req.raw.headers,
        body: { userId: id },
      })
      await recordAudit({
        actorId: session.user.id,
        action: "users:unban",
        targetId: id,
        ipAddress: clientIp(c.req.raw.headers),
      })
      return c.json(updated)
    } catch (err) {
      return c.json({ error: errorMessage(err) }, 400)
    }
  })
  // Delete a user
  .delete("/api/admin/users/:id", requirePermission("users:delete"), async (c) => {
    const session = c.get("session")
    const id = c.req.param("id")
    const [target] = await db.select().from(user).where(eq(user.id, id))
    if (!target) {
      return c.json({ error: "Not found" }, 404)
    }
    if (!authorize("users:delete", { actor: session.user, target })) {
      return c.json({ error: "Forbidden" }, 403)
    }
    try {
      await auth.api.removeUser({
        headers: c.req.raw.headers,
        body: { userId: id },
      })
      await recordAudit({
        actorId: session.user.id,
        action: "users:delete",
        targetId: id,
        details: `email: ${target.email}`,
        ipAddress: clientIp(c.req.raw.headers),
      })
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: errorMessage(err) }, 400)
    }
  })
