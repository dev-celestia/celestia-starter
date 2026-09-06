import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { category, post, user } from "@/lib/db/schema";
import { publishDuePosts } from "@/lib/cms/posts";
import { siteUrl } from "@/lib/cms/config";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles, updates, and guides.",
  alternates: { canonical: `${siteUrl()}/blog` },
};

/** Public blog index — server-rendered, only published posts (PRD 3.2). */
export default async function BlogIndexPage() {
  await publishDuePosts();

  const rows = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,
      authorName: user.name,
      guestAuthorName: post.guestAuthorName,
      categoryName: category.name,
      categorySlug: category.slug,
    })
    .from(post)
    .leftJoin(user, eq(post.createdBy, user.id))
    .leftJoin(category, eq(post.primaryCategoryId, category.id))
    .where(eq(post.status, "published"))
    .orderBy(desc(post.publishedAt))
    .limit(50);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm font-medium text-primary">
          <Link href="/" className="hover:underline">
            ← Back to Celestia
          </Link>
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Blog</h1>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts published yet.</p>
      ) : (
        <div className="space-y-8">
          {rows.map((row) => (
            <article key={row.id} className="group">
              {row.featuredImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.featuredImageUrl}
                  alt={row.featuredImageAlt ?? row.title}
                  className="mb-4 h-52 w-full rounded-xl border object-cover"
                  loading="lazy"
                />
              )}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {row.categoryName && (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                      {row.categoryName}
                    </span>
                  )}
                  {row.publishedAt && (
                    <time dateTime={row.publishedAt.toISOString()}>
                      {row.publishedAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  <span>
                    By {row.guestAuthorName ?? row.authorName ?? "Celestia"}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  <Link href={`/blog/${row.slug}`} className="hover:underline">
                    {row.title}
                  </Link>
                </h2>
                {row.excerpt && (
                  <p className="text-sm leading-6 text-muted-foreground">{row.excerpt}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export const revalidate = 0;
