import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { post, postRevision, user } from "@/lib/db/schema";
import { requireCmsSession, canReadPost } from "@/lib/cms/rbac";

type RouteContext = { params: Promise<{ id: string }> };

/** Revision history for a post, newest first. */
export async function GET(_request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;

  const [current] = await db
    .select({ id: post.id, createdBy: post.createdBy })
    .from(post)
    .where(eq(post.id, id))
    .limit(1);
  if (!current || !canReadPost(session, current)) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  const rows = await db
    .select({
      id: postRevision.id,
      label: postRevision.label,
      createdAt: postRevision.createdAt,
      authorName: user.name,
    })
    .from(postRevision)
    .leftJoin(user, eq(postRevision.createdBy, user.id))
    .where(eq(postRevision.postId, id))
    .orderBy(desc(postRevision.createdAt))
    .limit(100);

  return Response.json({ revisions: rows });
}
