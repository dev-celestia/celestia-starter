export const POST_STATUSES = [
  "draft",
  "pending_review",
  "scheduled",
  "published",
  "archived",
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export function isPostStatus(value: string): value is PostStatus {
  return (POST_STATUSES as readonly string[]).includes(value);
}

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

/**
 * Allowed status transitions regardless of role. Role rules are applied at the
 * route level (writers may only submit their own drafts for review).
 */
const TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  draft: ["pending_review", "scheduled", "published", "archived"],
  pending_review: ["draft", "scheduled", "published"],
  scheduled: ["draft", "published", "archived"],
  published: ["draft", "archived"],
  archived: ["draft"],
};

export function canTransition(from: PostStatus, to: PostStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Writers can only move their own draft into review; everything else is editor+. */
export function canTransitionAsRole(
  role: string | null | undefined,
  from: PostStatus,
  to: PostStatus,
  isOwner: boolean,
): boolean {
  if (!canTransition(from, to)) return false;
  if (role === "admin" || role === "editor") return true;
  return role === "writer" && isOwner && from === "draft" && to === "pending_review";
}
