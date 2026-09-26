import { z } from "zod";
import { db } from "@/lib/db";
import { post } from "@/lib/db/schema";
import { requireCmsSession, isEditorLevel } from "@/lib/cms/rbac";
import { publishDuePosts, listPosts } from "@/lib/cms/posts";
import { slugify, uniqueSlug } from "@/lib/cms/slug";

const createSchema = z.object({
  title: z.string().min(1).max(300),
  contentBody: z.string().max(500_000).optional(),
  excerpt: z.string().max(1000).nullish(),
  slug: z.string().max(120).optional(),
  primaryCategoryId: z.string().max(64).nullish(),
});

export async function GET(request: Request) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }

  await publishDuePosts();

  const url = new URL(request.url);
  const result = await listPosts({
    // Writers only see their own posts (drafts are private to author + editors).
    authorId: isEditorLevel(session.user.role)
      ? (url.searchParams.get("authorId") ?? undefined)
      : session.user.id,
    status: url.searchParams.get("status") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    tagSlug: url.searchParams.get("tag") ?? undefined,
    page: Number(url.searchParams.get("page") ?? "1") || 1,
    limit: Number(url.searchParams.get("limit") ?? "20") || 20,
  });
  return Response.json(result);
}

export async function POST(request: Request) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }
  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : await uniqueSlug(data.title);

  const [created] = await db
    .insert(post)
    .values({
      id: `post_${crypto.randomUUID().slice(0, 12)}`,
      title: data.title,
      slug,
      contentBody: data.contentBody ?? "",
      excerpt: data.excerpt ?? null,
      primaryCategoryId: data.primaryCategoryId ?? null,
      status: "draft",
      createdBy: session.user.id,
      updatedBy: session.user.id,
    })
    .returning();

  return Response.json(created, { status: 201 });
}
