"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleNotch, ArrowsCounterClockwise, Columns } from "@phosphor-icons/react";
import { Button, ScrollArea } from "@celestia-project/ui";
import { diffLines } from "@/lib/cms/diff";
import type { DiffLine } from "@/lib/cms/diff";
import type { PostDetail, RevisionSummary } from "./types";

interface RevisionSnapshot {
  contentBody: string;
  title?: string;
  slug?: string;
}

/** Pair removed/added runs into side-by-side rows (PRD 3.5 visual diff tool). */
function buildSideBySide(oldText: string, newText: string): {
  left?: DiffLine;
  right?: DiffLine;
}[] {
  const diff = diffLines(oldText, newText);
  const rows: { left?: DiffLine; right?: DiffLine }[] = [];
  let i = 0;
  while (i < diff.length) {
    const line = diff[i]!;
    if (line.type === "same") {
      rows.push({ left: line, right: line });
      i++;
    } else {
      const removedRun: DiffLine[] = [];
      const addedRun: DiffLine[] = [];
      while (i < diff.length && diff[i]!.type === "removed") removedRun.push(diff[i++]!);
      while (i < diff.length && diff[i]!.type === "added") addedRun.push(diff[i++]!);
      const max = Math.max(removedRun.length, addedRun.length);
      for (let k = 0; k < max; k++) {
        rows.push({ left: removedRun[k], right: addedRun[k] });
      }
    }
  }
  return rows;
}

/** Revision history, visual diff, and one-click rollback (PRD 3.5). */
export function RevisionsPanel({
  postId,
  current,
  onRolledBack,
  canEdit,
}: {
  postId: string;
  current: PostDetail;
  onRolledBack: (post: PostDetail) => void;
  canEdit: boolean;
}) {
  const [revisions, setRevisions] = useState<RevisionSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<RevisionSnapshot | null>(null);
  const [busy, setBusy] = useState(false);

  const select = (id: string | null) => {
    setSelectedId(id);
    setSnapshot(null);
  };

  const load = useCallback(() => {
    fetch(`/api/cms/posts/${postId}/revisions`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => {
        setRevisions(d.revisions ?? []);
        const first = (d.revisions ?? [])[0];
        select(first?.id ?? null);
      })
      .catch((e) => {
        toast.error(String(e.message));
        setRevisions([]);
      });
  }, [postId]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/cms/posts/${postId}/revisions/${selectedId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setSnapshot(d.snapshot as RevisionSnapshot))
      .catch(() => setSnapshot(null));
  }, [selectedId, postId]);

  const rollback = async () => {
    if (!selectedId) return;
    setBusy(true);
    const res = await fetch(`/api/cms/posts/${postId}/revisions/${selectedId}/rollback`, {
      method: "POST",
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Rollback failed");
      return;
    }
    toast.success("Rolled back to snapshot");
    onRolledBack(data);
    load();
  };

  const rows =
    snapshot && current ? buildSideBySide(snapshot.contentBody, current.contentBody) : [];

  return (
    <div className="space-y-4">
      <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border p-2">
        {revisions === null ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            <CircleNotch className="mx-auto size-4 animate-spin" />
          </p>
        ) : revisions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No revisions yet — save or change status to create one.
          </p>
        ) : (
          revisions.map((rev) => (
            <button
              key={rev.id}
              type="button"
              onClick={() => select(rev.id)}
              className={`block w-full rounded-md px-2 py-1.5 text-start text-xs transition-colors ${
                selectedId === rev.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <span className="font-medium">{rev.label ?? "Snapshot"}</span>
              <span className="ms-2 text-muted-foreground">
                {new Date(rev.createdAt).toLocaleString("en-US")}
                {rev.authorName ? ` · ${rev.authorName}` : ""}
              </span>
            </button>
          ))
        )}
      </div>

      {snapshot && (
        <>
          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-2 border-b bg-muted/50 text-xs font-medium">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <Columns className="size-3.5" /> Snapshot
              </div>
              <div className="flex items-center gap-1.5 border-s px-3 py-2">
                <Columns className="size-3.5" /> Current
              </div>
            </div>
            <ScrollArea className="h-72">
              <div className="grid grid-cols-2 font-mono text-[11px] leading-5">
                {rows.map((row, idx) => (
                  <DiffRow key={idx} row={row} />
                ))}
              </div>
            </ScrollArea>
          </div>

          <Button
            variant="outline"
            className="w-full"
            disabled={busy || !canEdit}
            onClick={() => void rollback()}
          >
            {busy ? <CircleNotch className="size-4 animate-spin" /> : <ArrowsCounterClockwise className="size-4" />}
            Roll back to this snapshot
          </Button>
        </>
      )}
    </div>
  );
}

function DiffRow({ row }: { row: { left?: DiffLine; right?: DiffLine } }) {
  const cell = (line: DiffLine | undefined, side: "left" | "right") => {
    if (!line) {
      return <div className={`min-h-5 px-3 ${side === "right" ? "border-s" : ""} bg-muted/30`} />;
    }
    const tone =
      line.type === "removed"
        ? "bg-red-500/10 text-red-700 dark:text-red-400"
        : line.type === "added"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "";
    return (
      <div
        className={`min-h-5 whitespace-pre-wrap px-3 ${side === "right" ? "border-s" : ""} ${tone}`}
      >
        {line.text || "\u00A0"}
      </div>
    );
  };
  return (
    <>
      {cell(row.left, "left")}
      {cell(row.right, "right")}
    </>
  );
}
