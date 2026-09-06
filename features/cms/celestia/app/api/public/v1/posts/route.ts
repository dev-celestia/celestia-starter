import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { category, post, postAuthor, postTag, tag, user } from "@/lib/db/schema";
import {
  authenticateDelivery,
  deliveryError,
  deliveryPreflight,
  deliveryResponse,
} from "@/lib/cms/delivery";
import { publishDuePosts } from "@/lib/cms/posts";

export async function OPTIONS() {
  return deliveryPreflight();
}

/**
 * Delivery API — read-only feed of published posts for external websites
 * (centralized content management across sites). Bearer-key authenticated,
 * CORS-enabled, returns markdown for the consumer to render.
 */
export async function GET(request: Request) {
  const key = await authenticateDelivery(request);
  if (!key) {
    return deliveryError("Invalid or missing API key", 401);
  }

  await publishDuePosts();

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20") || 20));
  const categorySlug = url.searchParams.get("category");
  const tagSlug = url.searchParams.get("tag");
  const q = url.searchParams.get("q");
  const withContent = url.searchParams.get("content") !== "0"; // ?content=0 for light listings

  const conditions = [eq(post.status, "published")];
  if (categorySlug) conditions.push(eq(category.slug, categorySlug));
  if (q) conditions.push(or(ilike(post.title, `%${q}%`), ilike(post.excerpt, `%${q}%`))!);
  if (tagSlug) {
    conditions.push(
      sql`exists (select 1 from ${postTag} join ${tag} on ${tag.id} = ${postTag.tagId} where ${postTag.postId} = ${post.id} and ${tag.slug} = ${tagSlug})`,
    );
  }
  const where = and(...conditions);

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        contentBody: withContent ? post.contentBody : sql<string>`''`,
        featuredImageUrl: post.featuredImageUrl,
        featuredImageAlt: post.featuredImageAlt,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        ogImageUrl: post.ogImageUrl,
        canonicalUrl: post.canonicalUrl,
        guestAuthorName: post.guestAuthorName,
        authorName: user.name,
        categoryName: category.name,
        categorySlug: category.slug,
      })
      .from(post)
      .leftJoin(user, eq(post.createdBy, user.id))
      .leftJoin(category, eq(post.primaryCategoryId, category.id))
      .where(where)
      .orderBy(desc(post.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(post)
      .leftJoin(category, eq(post.primaryCategoryId, category.id))
      .where(where),
  ]);

  const ids = rows.map((r) => r.id);
  const tagRows =
    ids.length > 0
      ? await db
          .select({ postId: postTag.postId, name: tag.name, slug: tag.slug })
          .from(postTag)
          .innerJoin(tag, eq(postTag.tagId, tag.id))
          .where(inArray(postTag.postId, ids))
      : [];
  const bylineRows =
    ids.length > 0
      ? await db
          .select({ postId: postAuthor.postId, name: user.name, position: postAuthor.position })
          .from(postAuthor)
          .innerJoin(user, eq(postAuthor.userId, user.id))
          .where(inArray(postAuthor.postId, ids))
          .orderBy(postAuthor.position)
      : [];

  return deliveryResponse({
    posts: rows.map((row) => ({
      ...row,
      category: row.categorySlug ? { name: row.categoryName, slug: row.categorySlug } : null,
      categoryName: undefined,
      categorySlug: undefined,
      tags: tagRows.filter((t) => t.postId === row.id).map((t) => ({ name: t.name, slug: t.slug })),
      authors: bylineRows.filter((b) => b.postId === row.id).map((b) => b.name),
    })),
    total: totalRows[0]?.count ?? 0,
    page,
    limit,
  });
}
