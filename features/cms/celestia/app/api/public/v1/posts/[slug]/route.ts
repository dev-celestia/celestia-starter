import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { category, post, postAuthor, postTag, tag, user } from "@/lib/db/schema";
import {
  authenticateDelivery,
  deliveryError,
  deliveryPreflight,
  deliveryResponse,
} from "@/lib/cms/delivery";
import { publishDuePosts } from "@/lib/cms/posts";

type RouteContext = { params: Promise<{ slug: string }> };

export async function OPTIONS() {
  return deliveryPreflight();
}

/** Delivery API — single published post by slug, with tags and byline. */
export async function GET(request: Request, { params }: RouteContext) {
  const key = await authenticateDelivery(request);
  if (!key) {
    return deliveryError("Invalid or missing API key", 401);
  }

  await publishDuePosts();
  const { slug } = await params;

  const [row] = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentBody: post.contentBody,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,
      status: post.status,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      ogTitle: post.ogTitle,
      ogDescription: post.ogDescription,
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
    .where(and(eq(post.slug, slug), eq(post.status, "published")))
    .limit(1);

  if (!row) {
    return deliveryError("Post not found", 404);
  }

  const tagRows = await db
    .select({ name: tag.name, slug: tag.slug })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, row.id));
  const bylineRows = await db
    .select({ name: user.name, position: postAuthor.position })
    .from(postAuthor)
    .innerJoin(user, eq(postAuthor.userId, user.id))
    .where(eq(postAuthor.postId, row.id))
    .orderBy(postAuthor.position);

  return deliveryResponse({
    post: {
      ...row,
      category: row.categorySlug ? { name: row.categoryName, slug: row.categorySlug } : null,
      categoryName: undefined,
      categorySlug: undefined,
      tags: tagRows,
      authors: bylineRows.map((b) => b.name),
    },
  });
}
