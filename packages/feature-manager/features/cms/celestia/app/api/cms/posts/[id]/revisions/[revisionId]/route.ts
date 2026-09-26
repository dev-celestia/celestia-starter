import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { post, postRevision } from "@/lib/db/schema";
import { requireCmsSession, canReadPost } from "@/lib/cms/rbac";

type RouteContext = { params: Promise<{ id: string; revisionId: string }> };

/** Full snapshot of a single revision (for the visual diff tool). */
export async function GET(_request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const { id, revisionId } = await params;

  const [current] = await db
    .select({ id: post.id, createdBy: post.createdBy })
    .from(post)
    .where(eq(post.id, id))
    .limit(1);
  if (!current || !canReadPost(session, current)) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  const [revision] = await db
    .select()
    .from(postRevision)
    .where(and(eq(postRevision.id, revisionId), eq(postRevision.postId, id)))
    .limit(1);
  if (!revision) {
    return Response.json({ error: "Revision not found" }, { status: 404 });
  }
  return Response.json(revision);
}
