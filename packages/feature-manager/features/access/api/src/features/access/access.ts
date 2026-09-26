import { createMiddleware } from "hono/factory"

import { auditLog, db } from "@workspace/db"

import { auth, type Session } from "../../auth"

/**
 * Access control layer for the API.
 *
 * - RBAC: global roles map to permissions; guard any Hono route with
 *   `requirePermission(...)`.
 * - ABAC: attribute-based `policies` decide resource-level access from
 *   actor/target attributes; call `authorize(...)` before touching a resource.
 */

export const ROLES = ["user", "admin"] as const
export type Role = (typeof ROLES)[number]

/** What each global role may do. Extend with your own permissions. */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  user: [],
  admin: [
    "users:list",
    "users:read",
    "users:set-role",
    "users:ban",
    "users:unban",
    "users:delete",
  ],
}

/** Hono env for routes guarded by `requirePermission`. */
export type AccessEnv = {
  Variables: {
    session: Session
  }
}

/**
 * Hono middleware: requires a session whose role grants every permission.
 * Stores the session in the context (`c.get("session")`).
 */
export function requirePermission(...permissions: string[]) {
  return createMiddleware<AccessEnv>(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const role = (session.user.role ?? "user") as Role
    const granted = ROLE_PERMISSIONS[role] ?? []
    const allowed = permissions.every((p) => granted.includes(p))
    if (!allowed) {
      return c.json({ error: "Forbidden" }, 403)
    }

    c.set("session", session)
    await next()
  })
}

export type PolicyActor = { id: string; role?: string | null }
export type PolicyTarget = { id: string; role?: string | null }
export type PolicyContext = { actor: PolicyActor; target: PolicyTarget }
export type Policy = (ctx: PolicyContext) => boolean

/**
 * Attribute-based policies: decisions driven by actor/target attributes
 * rather than roles alone. Returning false denies the action. Add your own
 * policies here (e.g. "owner only", time-of-day, verified-email) and call
 * `authorize()` in your routes.
 */
export const policies = {
  // Never let an admin demote themselves — they would lock themselves out
  "users:set-role": ({ actor, target }) =>
    actor.id !== target.id && target.role !== "admin",
  // Never ban yourself or another admin
  "users:ban": ({ actor, target }) =>
    actor.id !== target.id && target.role !== "admin",
  // Never delete yourself or another admin
  "users:delete": ({ actor, target }) =>
    actor.id !== target.id && target.role !== "admin",
} satisfies Record<string, Policy>

export type PolicyAction = keyof typeof policies

/** Evaluate a policy for an action. Returns false when the action is denied. */
export function authorize(action: PolicyAction, ctx: PolicyContext): boolean {
  return policies[action](ctx)
}

/**
 * Audit trail: append an entry to the `audit_log` table after a successful
 * admin action. Failures are logged, never thrown — auditing must not break
 * the request it observes.
 */
export async function recordAudit(entry: {
  actorId: string
  action: string
  targetId?: string | null
  details?: string | null
  ipAddress?: string | null
}): Promise<void> {
  try {
    await db.insert(auditLog).values({
      id: crypto.randomUUID(),
      actorId: entry.actorId,
      action: entry.action,
      targetId: entry.targetId ?? null,
      details: entry.details ?? null,
      ipAddress: entry.ipAddress ?? null,
    })
  } catch (err) {
    console.error("[access] failed to write audit log entry", err)
  }
}
