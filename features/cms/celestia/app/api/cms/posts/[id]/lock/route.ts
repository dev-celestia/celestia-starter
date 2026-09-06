import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { post } from "@/lib/db/schema";
import { requireCmsSession, canEditPost, canReadPost } from "@/lib/cms/rbac";
import { isLockActive } from "@/lib/cms/posts";
import { CMS_CONFIG } from "@/lib/cms/config";

type RouteContext = { params: Promise<{ id: string }> };

const lockSchema = z.object({
  action: z.enum(["acquire", "heartbeat", "release"]),
});

/**
 * Soft-locking (PRD: display a banner when another user is actively modifying a
 * draft). The client acquires on mount, heartbeats every 30s, releases on
 * unmount. Locks expire after CMS_CONFIG.lockTtlMs.
 */
export async function POST(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const parsed = lockSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const [current] = await db.select().from(post).where(eq(post.id, id)).limit(1);
  if (!current || !canReadPost(session, current)) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  const mine = current.lockedBy === session.user.id;
  const activeOther = isLockActive(current) && !mine;

  if (parsed.data.action === "release") {
    if (mine) {
      await db
        .update(post)
        .set({ lockedBy: null, lockedAt: null })
        .where(eq(post.id, id));
    }
    return Response.json({ locked: false });
  }

  if (parsed.data.action === "acquire" && activeOther) {
    return Response.json(
      { locked: true, lockedBy: current.lockedBy, ttlMs: CMS_CONFIG.lockTtlMs },
      { status: 409 },
    );
  }

  if (parsed.data.action === "heartbeat" && activeOther) {
    return Response.json(
      { locked: true, lockedBy: current.lockedBy, ttlMs: CMS_CONFIG.lockTtlMs },
      { status: 409 },
    );
  }

  // acquire (free or stale lock), heartbeat as owner, or takeover of a stale lock
  const canLock = canEditPost(session, current);
  if (!canLock) {
    return Response.json({ locked: true, lockedBy: session.user.id, readonly: true });
  }
  await db
    .update(post)
    .set({ lockedBy: session.user.id, lockedAt: new Date() })
    .where(eq(post.id, id));
  return Response.json({ locked: false, lockedBy: session.user.id, ttlMs: CMS_CONFIG.lockTtlMs });
}
