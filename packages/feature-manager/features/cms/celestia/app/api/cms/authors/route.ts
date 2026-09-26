import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireEditor } from "@/lib/cms/rbac";

/** User directory for byline assignment — editors and admins only. */
export async function GET() {
  try {
    await requireEditor();
  } catch (e) {
    return e as Response;
  }
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    })
    .from(user)
    .orderBy(asc(user.name))
    .limit(200);
  return Response.json({ users: rows });
}
