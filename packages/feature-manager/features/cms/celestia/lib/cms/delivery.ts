import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema";

export const DELIVERY_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function deliveryResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: DELIVERY_CORS_HEADERS });
}

export function deliveryError(message: string, status: number): Response {
  return Response.json({ error: message }, { status, headers: DELIVERY_CORS_HEADERS });
}

/** Preflight for external websites. */
export function deliveryPreflight(): Response {
  return new Response(null, { status: 204, headers: DELIVERY_CORS_HEADERS });
}

/**
 * Authenticates a Delivery API request via `Authorization: Bearer <key>` or
 * `?key=<key>`. Returns the key row, or null when missing/invalid/revoked.
 */
export async function authenticateDelivery(request: Request) {
  const header = request.headers.get("authorization");
  let token = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
  if (!token) {
    token = new URL(request.url).searchParams.get("key");
  }
  if (!token) return null;

  const [row] = await db.select().from(apiKey).where(eq(apiKey.key, token)).limit(1);
  if (!row || !row.active) return null;

  // best-effort last-used stamp; never blocks delivery
  void db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, row.id)).catch(() => {});
  return row;
}

export function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return `cms_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
