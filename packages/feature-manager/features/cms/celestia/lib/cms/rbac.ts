import { requireSession } from "@/lib/session";

export type CmsRole = "admin" | "editor" | "writer";

export const CMS_ROLES: CmsRole[] = ["admin", "editor", "writer"];

export type CmsSession = Awaited<ReturnType<typeof requireSession>>;

export function isCmsRole(role: string | null | undefined): role is CmsRole {
  return role === "admin" || role === "editor" || role === "writer";
}

export function isEditorLevel(role: string | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

function forbidden(message: string): Response {
  return Response.json({ error: message }, { status: 403 });
}

/** Any CMS role (admin, editor, writer). Throws a 401/403 Response on failure. */
export async function requireCmsSession(): Promise<CmsSession> {
  const session = await requireSession();
  if (!isCmsRole(session.user.role)) {
    throw forbidden("Forbidden — CMS access requires the writer, editor, or admin role");
  }
  return session;
}

/** Editor or admin. Throws a 401/403 Response on failure. */
export async function requireEditor(): Promise<CmsSession> {
  const session = await requireCmsSession();
  if (!isEditorLevel(session.user.role)) {
    throw forbidden("Forbidden — editor or admin role required");
  }
  return session;
}

/** Admin only. Throws a 401/403 Response on failure. */
export async function requireCmsAdmin(): Promise<CmsSession> {
  const session = await requireCmsSession();
  if (session.user.role !== "admin") {
    throw forbidden("Forbidden — admin role required");
  }
  return session;
}

/** Writers may only edit their own drafts; editors/admins edit everything. */
export function canEditPost(
  session: CmsSession,
  post: { createdBy: string | null; status: string },
): boolean {
  if (isEditorLevel(session.user.role)) return true;
  return post.createdBy === session.user.id && post.status === "draft";
}

/** Writers may only read their own posts; drafts are private to author + editors. */
export function canReadPost(
  session: CmsSession,
  post: { createdBy: string | null },
): boolean {
  if (isEditorLevel(session.user.role)) return true;
  return post.createdBy === session.user.id;
}
