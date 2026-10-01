import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema";
import { requireCmsAdmin } from "@/lib/cms/rbac";
import { generateApiKey, hashApiKey } from "@/lib/cms/delivery";

/** List Delivery API keys (admin only) — hashed at rest, no key material here. */
export async function GET() {
  try {
    await requireCmsAdmin();
  } catch (e) {
    return e as Response;
  }
  const rows = await db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      keyHint: apiKey.keyHint,
      active: apiKey.active,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
    })
    .from(apiKey)
    .orderBy(desc(apiKey.createdAt))
    .limit(100);
  return Response.json({ keys: rows });
}

const createSchema = z.object({ name: z.string().min(1).max(120) });

/**
 * Issue a Delivery API key (admin only). The raw key is returned exactly once
 * in this response; only its SHA-256 hash is stored.
 */
export async function POST(request: Request) {
  try {
    await requireCmsAdmin();
  } catch (e) {
    return e as Response;
  }
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }
  const raw = generateApiKey();
  const [created] = await db
    .insert(apiKey)
    .values({
      id: `key_${crypto.randomUUID().slice(0, 12)}`,
      name: parsed.data.name,
      keyHash: hashApiKey(raw),
      keyHint: raw.slice(0, 10),
    })
    .returning();
  return Response.json({ ...created, key: raw }, { status: 201 });
}
