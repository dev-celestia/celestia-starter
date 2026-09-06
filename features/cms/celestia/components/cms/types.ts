// Client-side CMS types — mirrors the API payloads without importing server code.
import type { PostStatus } from "@/lib/cms/status";

export type { PostStatus };

export interface TagRef {
  id: string;
  name: string;
  slug: string;
}

export interface BylineUser {
  id: string;
  name: string;
  image: string | null;
  position: number;
}

export interface PostDetail {
  id: string;
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
  createdBy: string | null;
  updatedBy: string | null;
  lockedBy: string | null;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  tags: TagRef[];
  byline: BylineUser[];
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  featuredImageUrl: string | null;
  authorId: string | null;
  authorName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  storage?: string;
  /** Provider-resolved public URL (present on API list responses). */
  url?: string;
  originalName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  bytes: number;
  variants: { url: string; width: number; height: number | null }[] | null;
  altText: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface RevisionSummary {
  id: string;
  label: string | null;
  createdAt: string;
  authorName: string | null;
}

export interface PostFormState {
  title: string;
  slug: string;
  slugTouched: boolean;
  contentBody: string;
  excerpt: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  noindex: boolean;
  nofollow: boolean;
  guestAuthorName: string;
  primaryCategoryId: string;
  tagIds: string[];
  authorIds: string[];
  publishedAt: string; // datetime-local value
  status: string;
}

export function formFromPost(post: PostDetail): PostFormState {
  return {
    title: post.title,
    slug: post.slug,
    slugTouched: true,
    contentBody: post.contentBody,
    excerpt: post.excerpt ?? "",
    featuredImageUrl: post.featuredImageUrl ?? "",
    featuredImageAlt: post.featuredImageAlt ?? "",
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    ogTitle: post.ogTitle ?? "",
    ogDescription: post.ogDescription ?? "",
    ogImageUrl: post.ogImageUrl ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    noindex: post.noindex,
    nofollow: post.nofollow,
    guestAuthorName: post.guestAuthorName ?? "",
    primaryCategoryId: post.primaryCategoryId ?? "",
    tagIds: post.tags.map((t) => t.id),
    authorIds: post.byline.map((b) => b.id),
    publishedAt: toDatetimeLocal(post.publishedAt),
    status: post.status,
  };
}

export function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
