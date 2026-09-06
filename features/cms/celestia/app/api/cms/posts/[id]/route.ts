import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { post, slugRedirect } from "@/lib/db/schema";
import {
  requireCmsSession,
  requireCmsAdmin,
  isEditorLevel,
  canEditPost,
  canReadPost,
} from "@/lib/cms/rbac";
import {
  createRevision,
  getPostDetail,
  isLockActive,
  setPostAuthors,
  setPostTags,
} from "@/lib/cms/posts";
import { slugTaken } from "@/lib/cms/slug";
import { canTransitionAsRole, POST_STATUSES } from "@/lib/cms/status";
import type { PostStatus } from "@/lib/cms/status";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().min(1).max(120).optional(),
  contentBody: z.string().max(500_000).optional(),
  excerpt: z.string().max(1000).nullish(),
  featuredImageUrl: z.string().max(2000).nullish(),
  featuredImageAlt: z.string().max(500).nullish(),
  status: z.enum(POST_STATUSES).optional(),
  publishedAt: z.string().datetime().nullish(),
  primaryCategoryId: z.string().max(64).nullish(),
  seoTitle: z.string().max(200).nullish(),
  seoDescription: z.string().max(500).nullish(),
  ogTitle: z.string().max(200).nullish(),
  ogDescription: z.string().max(500).nullish(),
  ogImageUrl: z.string().max(2000).nullish(),
  canonicalUrl: z.string().max(2000).nullish(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  guestAuthorName: z.string().max(200).nullish(),
  tagIds: z.array(z.string().max(64)).max(50).optional(),
  // editor+ only in practice (enforced below)
  authorIds: z.array(z.string().max(64)).max(20).optional(),
  saveType: z.enum(["manual", "autosave"]).default("manual"),
});

/** SEO/robots/canonical controls are editor+ per the PRD permission matrix. */
const EDITOR_ONLY_FIELDS = [
  "seoTitle",
  "seoDescription",
  "ogTitle",
  "ogDescription",
  "ogImageUrl",
  "canonicalUrl",
  "noindex",
  "nofollow",
  "authorIds",
] as const;

export async function GET(_request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const detail = await getPostDetail(id);
  if (!detail || !canReadPost(session, detail)) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }
  return Response.json(detail);
}

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
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }
  const body = parsed.data;

  const [current] = await db.select().from(post).where(eq(post.id, id)).limit(1);
  if (!current) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }
  if (!canReadPost(session, current)) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }
  if (isLockActive(current) && current.lockedBy !== session.user.id) {
    return Response.json(
      { error: "Post is locked by another editor", lockedBy: current.lockedBy },
      { status: 409 },
    );
  }
  if (!canEditPost(session, current)) {
    return Response.json(
      { error: "You cannot edit this post (contributors edit their own drafts only)" },
      { status: 403 },
    );
  }
  if (!isEditorLevel(session.user.role)) {
    const attempted = EDITOR_ONLY_FIELDS.filter((f) => body[f] !== undefined);
    if (attempted.length > 0) {
      return Response.json(
        { error: `Editor or admin role required to change: ${attempted.join(", ")}` },
        { status: 403 },
      );
    }
  }

  const values: Partial<typeof post.$inferInsert> = { updatedBy: session.user.id };
  const editorLevel = isEditorLevel(session.user.role);
  const isOwner = current.createdBy === session.user.id;
  let statusChanged = false;

  // --- status transition -----------------------------------------------------
  if (body.status && body.status !== current.status) {
    const target = body.status;
    if (!canTransitionAsRole(session.user.role, current.status as PostStatus, target, isOwner)) {
      return Response.json(
        { error: `Cannot move post from ${current.status} to ${target} as ${session.user.role}` },
        { status: 403 },
      );
    }
    if (target === "scheduled") {
      const when = body.publishedAt ? new Date(body.publishedAt) : current.publishedAt;
      if (!when || when.getTime() <= Date.now()) {
        return Response.json(
          { error: "Scheduling requires a future published_at timestamp" },
          { status: 400 },
        );
      }
      values.publishedAt = when;
    }
    if (target === "published") {
      values.publishedAt = body.publishedAt
        ? new Date(body.publishedAt)
        : (current.publishedAt ?? new Date());
    }
    values.status = target;
    statusChanged = true;
  }

  // --- slug + redirect on rename after publication ---------------------------
  if (body.slug && body.slug !== current.slug) {
    if (await slugTaken(body.slug, id)) {
      return Response.json({ error: "Slug already in use" }, { status: 400 });
    }
    values.slug = body.slug;
    if (["published", "scheduled", "archived"].includes(current.status)) {
      await db
        .insert(slugRedirect)
        .values({
          id: `red_${crypto.randomUUID().slice(0, 12)}`,
          oldSlug: current.slug,
          postId: id,
        })
        .onConflictDoNothing();
    }
  }

  if (body.title !== undefined) values.title = body.title;
  if (body.contentBody !== undefined) values.contentBody = body.contentBody;
  if (body.excerpt !== undefined) values.excerpt = body.excerpt;
  if (body.featuredImageUrl !== undefined) values.featuredImageUrl = body.featuredImageUrl;
  if (body.featuredImageAlt !== undefined) values.featuredImageAlt = body.featuredImageAlt;
  if (body.primaryCategoryId !== undefined) values.primaryCategoryId = body.primaryCategoryId;
  if (body.guestAuthorName !== undefined) values.guestAuthorName = body.guestAuthorName;
  if (body.publishedAt !== undefined && !statusChanged) {
    values.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  }
  if (editorLevel) {
    if (body.seoTitle !== undefined) values.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) values.seoDescription = body.seoDescription;
    if (body.ogTitle !== undefined) values.ogTitle = body.ogTitle;
    if (body.ogDescription !== undefined) values.ogDescription = body.ogDescription;
    if (body.ogImageUrl !== undefined) values.ogImageUrl = body.ogImageUrl;
    if (body.canonicalUrl !== undefined) values.canonicalUrl = body.canonicalUrl;
    if (body.noindex !== undefined) values.noindex = body.noindex;
    if (body.nofollow !== undefined) values.nofollow = body.nofollow;
  }

  const [updated] = await db.update(post).set(values).where(eq(post.id, id)).returning();

  if (body.tagIds) await setPostTags(id, body.tagIds);
  if (body.authorIds) await setPostAuthors(id, body.authorIds);

  // PRD: snapshot on every manual save and status change (autosave does not snapshot).
  if (statusChanged) {
    await createRevision(updated, `Status: ${updated.status}`, session.user.id);
  } else if (body.saveType === "manual") {
    await createRevision(updated, "Manual save", session.user.id);
  }

  const detail = await getPostDetail(id);
  return Response.json(detail);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireCmsAdmin();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const deleted = await db.delete(post).where(eq(post.id, id)).returning({ id: post.id });
  if (deleted.length === 0) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
