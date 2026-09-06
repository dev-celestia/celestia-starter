import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAsset } from "@/lib/db/schema";
import { requireCmsSession, requireEditor } from "@/lib/cms/rbac";
import { getStorageSettings, isR2Configured, deleteObject } from "@/lib/media/storage";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({ altText: z.string().max(500).nullish() });

/** Update alt text (PRD: alt-text enforcement). */
export async function PATCH(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  const [updated] = await db
    .update(mediaAsset)
    .set({ altText: parsed.data.altText ?? null })
    .where(eq(mediaAsset.id, id))
    .returning();
  if (!updated) {
    return Response.json({ error: "Asset not found" }, { status: 404 });
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
  const [asset] = await db
    .delete(mediaAsset)
    .where(eq(mediaAsset.id, id))
    .returning();
  if (!asset) {
    return Response.json({ error: "Asset not found" }, { status: 404 });
  }

  const storage = await getStorageSettings();
  // master + responsive variants (variant keys share the asset id prefix)
  const keys = [asset.filename];
  const variants = (asset.variants as { url: string }[] | null) ?? [];
  for (const v of variants) {
    const base = v.url.split("/").pop();
    if (base && !keys.includes(base)) keys.push(base);
  }
  for (const key of keys) {
    await deleteObject(storage, key);
  }
  return Response.json({ ok: true });
}
