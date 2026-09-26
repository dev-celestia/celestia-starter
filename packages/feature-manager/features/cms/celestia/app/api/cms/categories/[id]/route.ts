import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { requireEditor } from "@/lib/cms/rbac";
import { slugify, slugTaken } from "@/lib/cms/slug";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).nullish(),
  parentId: z.string().max(64).nullish(),
});

export async function PATCH(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireEditor();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }
  const { name, description, parentId } = parsed.data;
  if (parentId === id) {
    return Response.json({ error: "A category cannot be its own parent" }, { status: 400 });
  }

  const values: Partial<typeof category.$inferInsert> = {};
  if (name !== undefined) {
    values.name = name;
    if (await slugTaken(slugify(name), undefined)) {
      // slug uniqueness is derived from name; check excluding this row via slug
      const [conflict] = await db
        .select({ id: category.id })
        .from(category)
        .where(eq(category.slug, slugify(name)))
        .limit(1);
      if (conflict && conflict.id !== id) {
        return Response.json({ error: "A category with this slug already exists" }, { status: 400 });
      }
    }
  }
  if (description !== undefined) values.description = description;
  if (parentId !== undefined) values.parentId = parentId;

  const [updated] = await db
    .update(category)
    .set(values)
    .where(eq(category.id, id))
    .returning();
  if (!updated) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }
  void session;
  return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireEditor();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const deleted = await db
    .delete(category)
    .where(eq(category.id, id))
    .returning({ id: category.id });
  if (deleted.length === 0) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
