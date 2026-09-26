import { z } from "zod";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAsset } from "@/lib/db/schema";
import { requireCmsSession, requireEditor } from "@/lib/cms/rbac";
import { CMS_CONFIG } from "@/lib/cms/config";

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
  // best-effort file cleanup; variants share the id prefix
  try {
    const dir = path.join(process.cwd(), CMS_CONFIG.uploadDir);
    await unlink(path.join(dir, asset.filename));
  } catch {
    // file already gone — ignore
  }
  return Response.json({ ok: true });
}
