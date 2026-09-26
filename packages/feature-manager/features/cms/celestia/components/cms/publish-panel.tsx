"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CircleNotch, CalendarCheck, PaperPlaneRight, SealCheck, Archive, XCircle, ArrowCounterClockwise, Warning } from "@phosphor-icons/react";
import { Button, Input, Label } from "@celestia-project/ui";
import { STATUS_LABELS } from "@/lib/cms/status";
import type { PostStatus } from "@/lib/cms/status";
import type { PostFormState } from "./types";

export interface PublishPanelProps {
  form: PostFormState;
  postId: string | null;
  role: string | null | undefined;
  update: (patch: Partial<PostFormState>) => void;
  onStatusChanged: (status: string, publishedAt: string | null) => void;
  onSaveDraft: () => Promise<boolean>;
}

/**
 * Editorial workflow (PRD 3.2): Draft → Pending Review → Scheduled → Published
 * (+ Archived), with role-gated actions and future-date validation.
 */
export function PublishPanel({ form, postId, role, update, onStatusChanged, onSaveDraft }: PublishPanelProps) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const editorLevel = role === "admin" || role === "editor";
  const status = form.status as PostStatus;

  const featuredImageMissingAlt =
    Boolean(form.featuredImageUrl) && !form.featuredImageAlt.trim();
  // server re-validates the schedule time; this is a client-side hint only
  const scheduledInPast = // eslint-disable-next-line react-hooks/purity
    Boolean(form.publishedAt) && new Date(form.publishedAt).getTime() <= Date.now();

  const patchStatus = async (target: string, publishedAt?: string | null) => {
    if (!postId) return;
    setBusy(true);
    const res = await fetch(`/api/cms/posts/${postId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: target,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
        saveType: "manual",
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Action failed");
      return;
    }
    toast.success(`Status: ${STATUS_LABELS[target as PostStatus] ?? target}`);
    onStatusChanged(
      data.status,
      data.publishedAt ?? null,
    );
  };

  const submitForReview = async () => {
    if (!postId) return;
    if (!(await onSaveDraft())) return;
    setBusy(true);
    const res = await fetch(`/api/cms/posts/${postId}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Submit failed");
      return;
    }
    toast.success("Submitted for review");
    onStatusChanged("pending_review", data.publishedAt ?? null);
  };

  const review = async (action: "approve" | "reject", opts?: { publishNow?: boolean }) => {
    if (!postId) return;
    setBusy(true);
    const body: Record<string, unknown> = { action };
    if (action === "approve") {
      body.publishNow = Boolean(opts?.publishNow);
      if (!opts?.publishNow && form.publishedAt) {
        body.publishedAt = new Date(form.publishedAt).toISOString();
      }
    }
    if (action === "reject" && rejectComment.trim()) body.comment = rejectComment.trim();
    const res = await fetch(`/api/cms/posts/${postId}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Review action failed");
      return;
    }
    if (action === "reject") {
      setRejecting(false);
      setRejectComment("");
      toast.success("Sent back to draft");
      onStatusChanged("draft", data.publishedAt ?? null);
    } else {
      toast.success(opts?.publishNow ? "Published" : "Scheduled");
      onStatusChanged(data.status, data.publishedAt ?? null);
    }
  };

  if (!postId) {
    return (
      <p className="text-sm text-muted-foreground">
        Save the draft once to unlock the publishing workflow.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
        <span className="text-sm text-muted-foreground">Current status</span>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      {featuredImageMissingAlt && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
          <Warning className="mt-0.5 size-3.5 shrink-0" />
          Add alt text to the featured image before publishing (SEO requirement).
        </p>
      )}
      {scheduledInPast && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
          <Warning className="mt-0.5 size-3.5 shrink-0" />
          The scheduled time is in the past — pick a future timestamp.
        </p>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="publish-at">Publish at</Label>
        <Input
          id="publish-at"
          type="datetime-local"
          aria-label="Schedule publish time"
          value={form.publishedAt}
          onChange={(e) => update({ publishedAt: e.target.value })}
        />
        <p className="text-[11px] text-muted-foreground">
          Required future timestamp for “Approve &amp; schedule”.
        </p>
      </div>

      {/* --- role/status actions --- */}
      <div className="grid gap-2">
        {status === "draft" && (
          <>
            <Button variant="outline" disabled={busy} onClick={() => void submitForReview()}>
              {busy ? <CircleNotch className="size-4 animate-spin" /> : <PaperPlaneRight className="size-4" />}
              Submit for review
            </Button>
            {editorLevel && (
              <>
                <Button
                  disabled={busy || featuredImageMissingAlt}
                  onClick={() => void review("approve", { publishNow: true })}
                >
                  <SealCheck className="size-4" /> Publish now
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || featuredImageMissingAlt || scheduledInPast || !form.publishedAt}
                  onClick={() => void review("approve")}
                >
                  <CalendarCheck className="size-4" /> Approve & schedule
                </Button>
                <Button variant="ghost" disabled={busy} onClick={() => void patchStatus("archived")}>
                  <Archive className="size-4" /> Archive
                </Button>
              </>
            )}
          </>
        )}

        {status === "pending_review" && editorLevel && (
          <>
            <Button
              disabled={busy || featuredImageMissingAlt}
              onClick={() => void review("approve", { publishNow: true })}
            >
              <SealCheck className="size-4" /> Approve & publish now
            </Button>
            <Button
              variant="outline"
              disabled={busy || featuredImageMissingAlt || scheduledInPast || !form.publishedAt}
              onClick={() => void review("approve")}
            >
              <CalendarCheck className="size-4" /> Approve & schedule
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => setRejecting((v) => !v)}>
              <XCircle className="size-4" /> Reject
            </Button>
            {rejecting && (
              <div className="grid gap-1.5 rounded-lg border p-3">
                <Label htmlFor="reject-comment">Rejection note (optional)</Label>
                <Input
                  id="reject-comment"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="What should the author change?"
                />
                <Button variant="destructive" size="sm" disabled={busy} onClick={() => void review("reject")}>
                  Send back to draft
                </Button>
              </div>
            )}
          </>
        )}
        {status === "pending_review" && !editorLevel && (
          <p className="text-sm text-muted-foreground">
            Locked for editing while an editor reviews this draft.
          </p>
        )}

        {status === "scheduled" && editorLevel && (
          <>
            <Button
              disabled={busy || featuredImageMissingAlt}
              onClick={() => void review("approve", { publishNow: true })}
            >
              <SealCheck className="size-4" /> Publish now
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => void patchStatus("draft")}>
              <ArrowCounterClockwise className="size-4" /> Unschedule (back to draft)
            </Button>
          </>
        )}

        {status === "published" && editorLevel && (
          <>
            <Button variant="outline" disabled={busy} onClick={() => void patchStatus("draft")}>
              <ArrowCounterClockwise className="size-4" /> Unpublish (back to draft)
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => void patchStatus("archived")}>
              <Archive className="size-4" /> Archive
            </Button>
          </>
        )}

        {status === "archived" && editorLevel && (
          <Button variant="outline" disabled={busy} onClick={() => void patchStatus("draft")}>
            <ArrowCounterClockwise className="size-4" /> Restore to draft
          </Button>
        )}
      </div>
    </div>
  );
}
