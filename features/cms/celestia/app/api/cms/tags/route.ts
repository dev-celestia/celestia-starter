import { z } from "zod";
import { asc, eq, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { tag } from "@/lib/db/schema";
import { requireCmsSession, requireEditor } from "@/lib/cms/rbac";
import { slugify } from "@/lib/cms/slug";

/** Free-form tags with autocomplete from existing tags (PRD 3.3). */
export async function GET(request: Request) {
  try {
    await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const rows = await db
    .select()
    .from(tag)
    .where(q ? ilike(tag.name, `%${q}%`) : undefined)
    .orderBy(asc(tag.name))
    .limit(q ? 10 : 200);
  return Response.json({ tags: rows });
}

const createSchema = z.object({ name: z.string().min(1).max(80) });

export async function POST(request: Request) {
  let session;
  try {
    session = await requireEditor();
  } catch (e) {
    return e as Response;
  }
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }
  const name = parsed.data.name.trim();
  const slug = slugify(name);
  if (!slug) {
    return Response.json({ error: "Tag name produces an empty slug" }, { status: 400 });
  }
  const [existing] = await db.select().from(tag).where(eq(tag.slug, slug)).limit(1);
  if (existing) {
    return Response.json(existing); // idempotent: return the existing tag
  }
  const [created] = await db
    .insert(tag)
    .values({ id: `tag_${crypto.randomUUID().slice(0, 12)}`, name, slug })
    .returning();
  void session;
  return Response.json(created, { status: 201 });
}
