import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { post, postRevision } from "@/lib/db/schema";
import { requireCmsSession, canEditPost, canReadPost } from "@/lib/cms/rbac";
import { createRevision, isLockActive } from "@/lib/cms/posts";
import { canTransition } from "@/lib/cms/status";
import type { PostSnapshot } from "@/lib/cms/posts";
import type { PostStatus } from "@/lib/cms/status";

type RouteContext = { params: Promise<{ id: string; revisionId: string }> };

/**
 * One-click rollback (PRD): reverts the post to a previous snapshot. Content
 * fields always roll back; the status only changes if the transition from the
 * current status is still legal (revisions never bypass the workflow).
 */
export async function POST(_request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const { id, revisionId } = await params;

  const [current] = await db.select().from(post).where(eq(post.id, id)).limit(1);
  if (!current || !canReadPost(session, current)) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }
  if (!canEditPost(session, current)) {
    return Response.json({ error: "You cannot edit this post" }, { status: 403 });
  }
  if (isLockActive(current) && current.lockedBy !== session.user.id) {
    return Response.json({ error: "Post is locked by another editor" }, { status: 409 });
  }

  const [revision] = await db
    .select()
    .from(postRevision)
    .where(and(eq(postRevision.id, revisionId), eq(postRevision.postId, id)))
    .limit(1);
  if (!revision) {
    return Response.json({ error: "Revision not found" }, { status: 404 });
  }

  const snap = revision.snapshot as PostSnapshot;
  const nextStatus =
    snap.status !== current.status && canTransition(current.status as PostStatus, snap.status as PostStatus)
      ? snap.status
      : current.status;

  const [updated] = await db
    .update(post)
    .set({
      title: snap.title,
      slug: snap.slug,
      contentBody: snap.contentBody,
      excerpt: snap.excerpt,
      featuredImageUrl: snap.featuredImageUrl,
      featuredImageAlt: snap.featuredImageAlt,
      primaryCategoryId: snap.primaryCategoryId,
      publishedAt: snap.publishedAt ? new Date(snap.publishedAt) : null,
      seoTitle: snap.seoTitle,
      seoDescription: snap.seoDescription,
      ogTitle: snap.ogTitle,
      ogDescription: snap.ogDescription,
      ogImageUrl: snap.ogImageUrl,
      canonicalUrl: snap.canonicalUrl,
      noindex: snap.noindex,
      nofollow: snap.nofollow,
      guestAuthorName: snap.guestAuthorName,
      status: nextStatus,
      updatedBy: session.user.id,
    })
    .where(eq(post.id, id))
    .returning();

  await createRevision(
    updated,
    `Rollback to ${revision.createdAt.toLocaleString("en-US")}`,
    session.user.id,
  );
  return Response.json(updated);
}
