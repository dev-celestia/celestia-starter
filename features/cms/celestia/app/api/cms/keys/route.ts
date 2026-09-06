import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema";
import { requireCmsAdmin } from "@/lib/cms/rbac";
import { generateApiKey } from "@/lib/cms/delivery";

/** Manage Delivery API keys (admin only) — used by external websites. */
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
      key: apiKey.key,
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
  const [created] = await db
    .insert(apiKey)
    .values({
      id: `key_${crypto.randomUUID().slice(0, 12)}`,
      name: parsed.data.name,
      key: generateApiKey(),
    })
    .returning();
  return Response.json(created, { status: 201 });
}
