import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAsset } from "@/lib/db/schema";
import { requireCmsSession } from "@/lib/cms/rbac";

/** Media library listing (PRD 3.1 media management). */
export async function GET() {
  try {
    await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const rows = await db
    .select()
    .from(mediaAsset)
    .orderBy(desc(mediaAsset.createdAt))
    .limit(200);
  return Response.json({ assets: rows });
}
