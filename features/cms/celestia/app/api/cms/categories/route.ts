import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { requireCmsSession, requireEditor } from "@/lib/cms/rbac";
import { slugify, slugTaken } from "@/lib/cms/slug";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).nullish(),
  parentId: z.string().max(64).nullish(),
});

export async function GET() {
  try {
    await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const rows = await db.select().from(category).orderBy(asc(category.name));
  return Response.json({ categories: rows });
}

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
  const { name, description, parentId } = parsed.data;

  let slug = slugify(name);
  if (!slug) slug = `category-${Date.now()}`;
  if (await slugTaken(slug)) {
    return Response.json({ error: "A category with this slug already exists" }, { status: 400 });
  }
  if (parentId) {
    const [parent] = await db
      .select({ id: category.id })
      .from(category)
      .where(eq(category.id, parentId))
      .limit(1);
    if (!parent) {
      return Response.json({ error: "Parent category not found" }, { status: 400 });
    }
  }

  const [created] = await db
    .insert(category)
    .values({
      id: `cat_${crypto.randomUUID().slice(0, 12)}`,
      name,
      slug,
      description: description ?? null,
      parentId: parentId ?? null,
    })
    .returning();
  void session;
  return Response.json(created, { status: 201 });
}
