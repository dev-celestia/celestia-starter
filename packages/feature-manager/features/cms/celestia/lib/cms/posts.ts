import { and, asc, desc, eq, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  category,
  post,
  postAuthor,
  postRevision,
  postTag,
  tag,
  user,
} from "@/lib/db/schema";
import { CMS_CONFIG } from "@/lib/cms/config";

/** Editable fields captured in every revision snapshot. */
export interface PostSnapshot {
  title: string;
  slug: string;
  contentBody: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  status: string;
  primaryCategoryId: string | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  nofollow: boolean;
  guestAuthorName: string | null;
}

export function snapshotOf(row: typeof post.$inferSelect): PostSnapshot {
  return {
    title: row.title,
    slug: row.slug,
    contentBody: row.contentBody,
    excerpt: row.excerpt,
    featuredImageUrl: row.featuredImageUrl,
    featuredImageAlt: row.featuredImageAlt,
    status: row.status,
    primaryCategoryId: row.primaryCategoryId,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    ogTitle: row.ogTitle,
    ogDescription: row.ogDescription,
    ogImageUrl: row.ogImageUrl,
    canonicalUrl: row.canonicalUrl,
    noindex: row.noindex,
    nofollow: row.nofollow,
    guestAuthorName: row.guestAuthorName,
  };
}

/** PRD: save a snapshot on every manual save and status change. */
export async function createRevision(
  row: typeof post.$inferSelect,
  label: string,
  userId: string,
): Promise<void> {
  await db.insert(postRevision).values({
    id: `rev_${crypto.randomUUID().slice(0, 12)}`,
    postId: row.id,
    snapshot: snapshotOf(row),
    label,
    createdBy: userId,
  });
}

/**
 * Lazy scheduler: flips scheduled posts whose published_at has passed to
 * published. Called by public blog pages and dashboard listings so no external
 * cron is required.
 */
export async function publishDuePosts(): Promise<number> {
  const due = await db
    .update(post)
    .set({ status: "published" })
    .where(and(eq(post.status, "scheduled"), lte(post.publishedAt, new Date())))
    .returning({ id: post.id });
  return due.length;
}

export function isLockActive(row: { lockedBy: string | null; lockedAt: Date | null }): boolean {
  if (!row.lockedBy || !row.lockedAt) return false;
  return Date.now() - row.lockedAt.getTime() < CMS_CONFIG.lockTtlMs;
}

export type PostDetail = typeof post.$inferSelect & {
  authorName: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  tags: { id: string; name: string; slug: string }[];
  byline: { id: string; name: string; image: string | null; position: number }[];
};

export async function getPostDetail(id: string): Promise<PostDetail | null> {
  const rows = await db
    .select({
      post,
      authorName: user.name,
      categorySlug: category.slug,
      categoryName: category.name,
    })
    .from(post)
    .leftJoin(user, eq(post.createdBy, user.id))
    .leftJoin(category, eq(post.primaryCategoryId, category.id))
    .where(eq(post.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const tagRows = await db
    .select({ id: tag.id, name: tag.name, slug: tag.slug })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, id))
    .orderBy(asc(tag.name));

  const bylineRows = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      position: postAuthor.position,
    })
    .from(postAuthor)
    .innerJoin(user, eq(postAuthor.userId, user.id))
    .where(eq(postAuthor.postId, id))
    .orderBy(asc(postAuthor.position));

  return {
    ...row.post,
    authorName: row.authorName,
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    tags: tagRows,
    byline: bylineRows,
  };
}

export interface ListPostsOptions {
  status?: string;
  q?: string;
  authorId?: string;
  categoryId?: string;
  tagSlug?: string;
  page?: number;
  limit?: number;
}

export async function listPosts(options: ListPostsOptions) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (options.status) conditions.push(eq(post.status, options.status));
  if (options.authorId) conditions.push(eq(post.createdBy, options.authorId));
  if (options.categoryId) conditions.push(eq(post.primaryCategoryId, options.categoryId));
  if (options.q) {
    conditions.push(
      or(ilike(post.title, `%${options.q}%`), ilike(post.contentBody, `%${options.q}%`)),
    );
  }
  if (options.tagSlug) {
    conditions.push(
      sql`exists (select 1 from ${postTag} join ${tag} on ${tag.id} = ${postTag.tagId} where ${postTag.postId} = ${post.id} and ${tag.slug} = ${options.tagSlug})`,
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        status: post.status,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        featuredImageUrl: post.featuredImageUrl,
        authorId: post.createdBy,
        authorName: user.name,
        categoryName: category.name,
        categorySlug: category.slug,
      })
      .from(post)
      .leftJoin(user, eq(post.createdBy, user.id))
      .leftJoin(category, eq(post.primaryCategoryId, category.id))
      .where(where)
      .orderBy(desc(post.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(post).where(where),
  ]);

  return { posts: rows, total: totalRows[0]?.count ?? 0, page, limit };
}

/** Replace the tag set of a post (used by PATCH). */
export async function setPostTags(postId: string, tagIds: string[]): Promise<void> {
  await db.delete(postTag).where(eq(postTag.postId, postId));
  if (tagIds.length > 0) {
    const valid = await db.select({ id: tag.id }).from(tag).where(inArray(tag.id, tagIds));
    if (valid.length > 0) {
      await db
        .insert(postTag)
        .values(valid.map((t) => ({ postId, tagId: t.id })))
        .onConflictDoNothing();
    }
  }
}

/** Replace the byline of a post (used by PATCH). */
export async function setPostAuthors(postId: string, userIds: string[]): Promise<void> {
  await db.delete(postAuthor).where(eq(postAuthor.postId, postId));
  if (userIds.length > 0) {
    await db
      .insert(postAuthor)
      .values(userIds.map((userId, position) => ({ postId, userId, position })))
      .onConflictDoNothing();
  }
}
