import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema";
import { requireCmsAdmin } from "@/lib/cms/rbac";

type RouteContext = { params: Promise<{ id: string }> };

/** Revoke a Delivery API key (admin only). */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireCmsAdmin();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const deleted = await db
    .delete(apiKey)
    .where(eq(apiKey.id, id))
    .returning({ id: apiKey.id });
  if (deleted.length === 0) {
    return Response.json({ error: "Key not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
