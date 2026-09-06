import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { post } from "@/lib/db/schema";
import { slugify } from "@/lib/cms/slugify";

export { slugify };

/** Returns a unique slug derived from `base`, appending -2, -3, … on collision. */
export async function uniqueSlug(base: string, excludePostId?: string): Promise<string> {
  const root = slugify(base) || `post-${Date.now()}`;
  let candidate = root;
  for (let i = 2; i < 100; i++) {
    const rows = await db
      .select({ id: post.id })
      .from(post)
      .where(
        excludePostId
          ? and(eq(post.slug, candidate), ne(post.id, excludePostId))
          : eq(post.slug, candidate),
      )
      .limit(1);
    if (rows.length === 0) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

/** True when the slug is unused (optionally excluding one post being edited). */
export async function slugTaken(slug: string, excludePostId?: string): Promise<boolean> {
  const rows = await db
    .select({ id: post.id })
    .from(post)
    .where(
      excludePostId
        ? and(eq(post.slug, slug), ne(post.id, excludePostId))
        : eq(post.slug, slug),
    )
    .limit(1);
  return rows.length > 0;
}
