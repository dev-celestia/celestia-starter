import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { post } from "@/lib/db/schema";
import { requireEditor, canReadPost } from "@/lib/cms/rbac";
import { createRevision } from "@/lib/cms/posts";
import { canTransition } from "@/lib/cms/status";
import type { PostStatus } from "@/lib/cms/status";

type RouteContext = { params: Promise<{ id: string }> };

const reviewSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    publishNow: z.boolean().default(false),
    publishedAt: z.string().datetime().optional(),
    comment: z.string().max(1000).optional(),
  }),
  z.object({
    action: z.literal("reject"),
    comment: z.string().max(1000).optional(),
  }),
]);

/** Editor/admin review action: approve (→ scheduled or published) or reject (→ draft). */
export async function POST(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireEditor();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }
  const body = parsed.data;

  const [current] = await db.select().from(post).where(eq(post.id, id)).limit(1);
  if (!current || !canReadPost(session, current)) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }
  const from = current.status as PostStatus;

  if (body.action === "reject") {
    if (!canTransition(from, "draft")) {
      return Response.json({ error: `Cannot reject a post in status ${from}` }, { status: 400 });
    }
    const [updated] = await db
      .update(post)
      .set({ status: "draft", updatedBy: session.user.id })
      .where(eq(post.id, id))
      .returning();
    await createRevision(
      updated,
      body.comment ? `Rejected — ${body.comment}` : "Rejected back to draft",
      session.user.id,
    );
    return Response.json(updated);
  }

  const target: PostStatus = body.publishNow ? "published" : "scheduled";
  if (!canTransition(from, target)) {
    return Response.json({ error: `Cannot approve a post in status ${from}` }, { status: 400 });
  }

  const values: Partial<typeof post.$inferInsert> = { status: target, updatedBy: session.user.id };
  if (target === "scheduled") {
    const when = body.publishedAt ? new Date(body.publishedAt) : null;
    if (!when || when.getTime() <= Date.now()) {
      return Response.json(
        { error: "Scheduling requires a future published_at timestamp" },
        { status: 400 },
      );
    }
    values.publishedAt = when;
  }
  if (target === "published") {
    values.publishedAt = body.publishedAt ? new Date(body.publishedAt) : (current.publishedAt ?? new Date());
  }

  const [updated] = await db.update(post).set(values).where(eq(post.id, id)).returning();
  const comment = "comment" in body && body.comment ? ` — ${body.comment}` : "";
  await createRevision(updated, `Approved as ${target}${comment}`, session.user.id);
  return Response.json(updated);
}
