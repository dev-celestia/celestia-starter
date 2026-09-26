"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CircleNotch, Plus, Trash, PencilSimple } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui";
import { useSession } from "@/lib/auth-client";
import { timeAgo } from "@/lib/ui";
import { POST_STATUSES, STATUS_LABELS } from "@/lib/cms/status";
import type { PostStatus } from "@/lib/cms/status";
import type { PostListItem } from "@/components/cms/types";

const STATUS_TONES: Record<string, string> = {
  draft: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  pending_review: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  scheduled: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-muted text-muted-foreground",
};

export default function CmsPostsPage() {
  const { data: session } = useSession();
  const role = session?.user.role;
  const editorLevel = role === "admin" || role === "editor";

  const [posts, setPosts] = useState<PostListItem[] | null>(null);
  const [status, setStatus] = useState<string>("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (query) params.set("q", query);
    fetch(`/api/cms/posts?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setPosts(d.posts ?? []))
      .catch((e) => {
        toast.error(String(e.message));
        setPosts([]);
      });
  }, [status, query]);

  useEffect(load, [load]);

  const remove = async (id: string) => {
    const res = await fetch(`/api/cms/posts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      toast.error(d.error ?? "Delete failed");
      return;
    }
    toast.success("Post deleted");
    load();
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog posts</h1>
          <p className="text-sm text-muted-foreground">
            Draft, review, schedule, and publish articles.
          </p>
        </div>
        <Button render={<Link href="/dashboard/cms/posts/new" />}>
          <Plus className="size-4" /> New post
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={status}
              items={{ "": "All statuses", ...Object.fromEntries(POST_STATUSES.map((s) => [s, STATUS_LABELS[s]])) }}
              onValueChange={(v) => setStatus(v ?? "")}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["", ...POST_STATUSES].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "" ? "All statuses" : STATUS_LABELS[s as PostStatus]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <form
              className="flex flex-1 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(q);
              }}
            >
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search titles and content…"
                className="max-w-xs"
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {!posts ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              <CircleNotch className="mx-auto size-4 animate-spin" />
            </p>
          ) : posts.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No posts match. Create your first post to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/cms/posts/${post.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={STATUS_TONES[post.status]}>
                        {STATUS_LABELS[post.status as PostStatus] ?? post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{post.authorName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{post.categoryName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(post.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          render={
                            <Link href={`/dashboard/cms/posts/${post.id}/edit`} aria-label="Edit post" />
                          }
                        >
                          <PencilSimple className="size-4" />
                        </Button>
                        {role === "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete post"
                            onClick={() => void remove(post.id)}
                          >
                            <Trash className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {editorLevel ? null : (
        <p className="text-xs text-muted-foreground">
          You see your own posts. Editors and admins see everything.
        </p>
      )}
    </div>
  );
}
