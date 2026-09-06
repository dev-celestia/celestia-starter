import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAsset } from "@/lib/db/schema";
import { requireCmsSession } from "@/lib/cms/rbac";
import { assetUrl, getStorageSettings } from "@/lib/media/storage";

/** Media library listing with provider-resolved URLs. */
export async function GET() {
  try {
    await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const storage = await getStorageSettings();
  const rows = await db
    .select()
    .from(mediaAsset)
    .orderBy(desc(mediaAsset.createdAt))
    .limit(200);
  return Response.json({
    assets: rows.map((row) => ({ ...row, url: assetUrl(storage, row.filename) })),
  });
}
