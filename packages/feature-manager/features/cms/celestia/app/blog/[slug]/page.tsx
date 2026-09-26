import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { post, slugRedirect } from "@/lib/db/schema";
import { getPostDetail, publishDuePosts } from "@/lib/cms/posts";
import { CMS_CONFIG, siteUrl } from "@/lib/cms/config";
import { MarkdownContent } from "@/components/cms/markdown-content";

type PageProps = { params: Promise<{ slug: string }> };

async function findPublished(slug: string) {
  return db
    .select({ id: post.id })
    .from(post)
    .where(
      and(
        eq(post.slug, slug),
        or(eq(post.status, "published"), eq(post.status, "archived")),
      ),
    )
    .limit(1);
}

/** SEO metadata (PRD 3.4): meta title/description, OG/Twitter card, canonical, robots. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [row] = await db
    .select()
    .from(post)
    .where(eq(post.slug, slug))
    .limit(1);
  if (!row || row.status !== "published") {
    return { title: "Not found" };
  }

  const title = row.seoTitle || row.title;
  const description = row.seoDescription || row.excerpt || undefined;
  const ogImage = row.ogImageUrl || row.featuredImageUrl || undefined;
  const base = siteUrl();

  return {
    title,
    description,
    alternates: { canonical: row.canonicalUrl || `${base}/blog/${row.slug}` },
    robots: { index: !row.noindex, follow: !row.nofollow },
    openGraph: {
      title: row.ogTitle || title,
      description: row.ogDescription || description,
      url: `${base}/blog/${row.slug}`,
      siteName: "Celestia",
      type: "article",
      publishedTime: row.publishedAt?.toISOString(),
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: row.ogTitle || title,
      description: row.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/** Public post page. Old slugs 301-redirect; archived posts 404 (configurable). */
export default async function BlogPostPage({ params }: PageProps) {
  await publishDuePosts();
  const { slug } = await params;

  const [match] = await findPublished(slug);
  if (!match) {
    // slug changed after publication → 301 to the current slug (PRD 3.4)
    const [redirect] = await db
      .select()
      .from(slugRedirect)
      .where(eq(slugRedirect.oldSlug, slug))
      .limit(1);
    if (redirect) {
      const [target] = await db
        .select({ slug: post.slug, status: post.status })
        .from(post)
        .where(eq(post.id, redirect.postId))
        .limit(1);
      if (target && target.status === "published") {
        permanentRedirect(`/blog/${target.slug}`);
      }
      if (target && CMS_CONFIG.archiveBehavior === "redirect") {
        permanentRedirect(`/blog/${target.slug}`);
      }
    }
    notFound();
  }

  const detail = await getPostDetail(match.id);
  if (!detail || detail.status !== "published") notFound();

  const bylineNames = [
    ...detail.byline.map((b) => b.name),
    ...(detail.guestAuthorName ? [detail.guestAuthorName] : []),
  ];
  const published = detail.publishedAt
    ? new Date(detail.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <p className="text-sm font-medium text-primary">
        <Link href="/blog" className="hover:underline">
          ← All posts
        </Link>
      </p>

      <header className="mt-6 space-y-3">
        {detail.categoryName && (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {detail.categoryName}
          </p>
        )}
        <h1 className="text-4xl font-bold tracking-tight">{detail.title}</h1>
        <p className="text-sm text-muted-foreground">
          {bylineNames.length > 0 ? `By ${bylineNames.join(", ")}` : detail.authorName}
          {published ? ` · ${published}` : ""}
        </p>
      </header>

      {detail.featuredImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={detail.featuredImageUrl}
          alt={detail.featuredImageAlt ?? detail.title}
          className="mt-8 h-72 w-full rounded-2xl border object-cover"
        />
      )}

      <div className="mt-10">
        <MarkdownContent content={detail.contentBody} />
      </div>

      {detail.tags.length > 0 && (
        <footer className="mt-12 border-t pt-6">
          <div className="flex flex-wrap gap-2">
            {detail.tags.map((tag) => (
              <span key={tag.id} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                #{tag.name}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}

export const revalidate = 0;
