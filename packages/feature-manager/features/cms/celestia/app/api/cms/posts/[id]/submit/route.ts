import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { post } from "@/lib/db/schema";
import { requireCmsSession, canReadPost } from "@/lib/cms/rbac";
import { createRevision } from "@/lib/cms/posts";
import { canTransitionAsRole } from "@/lib/cms/status";
import type { PostStatus } from "@/lib/cms/status";

type RouteContext = { params: Promise<{ id: string }> };

/** Contributor/editor action: move a draft into the review queue. */
export async function POST(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const parsed = z
    .object({ comment: z.string().max(1000).optional() })
    .safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const [current] = await db.select().from(post).where(eq(post.id, id)).limit(1);
  if (!current || !canReadPost(session, current)) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }
  const isOwner = current.createdBy === session.user.id;
  if (!canTransitionAsRole(session.user.role, current.status as PostStatus, "pending_review", isOwner)) {
    return Response.json(
      { error: `Cannot submit a post in status ${current.status} for review` },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(post)
    .set({ status: "pending_review", updatedBy: session.user.id })
    .where(eq(post.id, id))
    .returning();
  await createRevision(
    updated,
    parsed.data.comment ? `Submitted for review — ${parsed.data.comment}` : "Submitted for review",
    session.user.id,
  );
  return Response.json(updated);
}
