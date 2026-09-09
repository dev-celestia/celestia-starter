"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, CircleNotch, Warning, LockSimple } from "@phosphor-icons/react";
import { Badge, Button, Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from "@celestia-project/ui";
import { BlockTextEditor } from "@celestia-project/ui/composite/block-text-editor";
import { slugify } from "@/lib/cms/slugify";
import { CMS_CONFIG } from "@/lib/cms/config";
import { useAutosave } from "./use-autosave";
import { formFromPost, toDatetimeLocal, type PostDetail, type PostFormState } from "./types";
import { SettingsPanel } from "./settings-panel";
import { SeoPanel } from "./seo-panel";
import { PublishPanel } from "./publish-panel";
import { RevisionsPanel } from "./revisions-panel";

const EMPTY_FORM: PostFormState = {
  title: "",
  slug: "",
  slugTouched: false,
  contentBody: "",
  excerpt: "",
  featuredImageUrl: "",
  featuredImageAlt: "",
  seoTitle: "",
  seoDescription: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  canonicalUrl: "",
  noindex: false,
  nofollow: false,
  guestAuthorName: "",
  primaryCategoryId: "",
  tagIds: [],
  authorIds: [],
  publishedAt: "",
  status: "draft",
};

function draftKey(postId: string | null): string {
  return `cms:draft:${postId ?? "new"}`;
}

/**
 * Post editor screen: BlockTextEditor (markdown) plus Settings / SEO / Publish /
 * Revisions rails. Handles auto-save, localStorage crash recovery, and
 * soft-locking (PRD 3.1, 3.5, section 5).
 */
export function PostEditor({
  postId,
  role,
  currentUserId,
}: {
  postId: string | null;
  role: string | null | undefined;
  currentUserId: string;
}) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [form, setForm] = useState<PostFormState>(EMPTY_FORM);
  const [activeId, setActiveId] = useState<string | null>(postId);
  const [loading, setLoading] = useState(Boolean(postId));
  const [lockInfo, setLockInfo] = useState<{ lockedBy: string } | null>(null);
  const [recovery, setRecovery] = useState<{ savedAt: string; form: PostFormState } | null>(null);
  const readonly = lockInfo !== null;
  const editorLevel = role === "admin" || role === "editor";

  const formRef = useRef(form);
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // --- load existing post + crash recovery -----------------------------------
  useEffect(() => {
    if (!postId) {
      // offer local recovery for unsaved new drafts (deferred out of the effect)
      queueMicrotask(() => {
        try {
          const raw = localStorage.getItem(draftKey(null));
          if (raw) {
            const parsed = JSON.parse(raw) as { savedAt: string; form: PostFormState };
            if (parsed.form?.title || parsed.form?.contentBody) setRecovery(parsed);
          }
        } catch {
          // ignore malformed drafts
        }
      });
      return;
    }
    let cancelled = false;
    fetch(`/api/cms/posts/${postId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load post");
        return r.json();
      })
      .then((data: PostDetail) => {
        if (cancelled) return;
        setPost(data);
        setForm(formFromPost(data));
        setLoading(false);
        try {
          const raw = localStorage.getItem(draftKey(postId));
          if (raw) {
            const parsed = JSON.parse(raw) as { savedAt: string; form: PostFormState };
            if (new Date(parsed.savedAt).getTime() > new Date(data.updatedAt).getTime()) {
              setRecovery(parsed);
            }
          }
        } catch {
          // ignore malformed drafts
        }
      })
      .catch((e) => {
        toast.error(String(e.message));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // --- save ------------------------------------------------------------------
  const buildBody = useCallback(
    (saveType: "manual" | "autosave") => {
      const f = formRef.current;
      return {
        title: f.title.trim() || "Untitled",
        slug: f.slug || slugify(f.title) || undefined,
        contentBody: f.contentBody,
        excerpt: f.excerpt || null,
        featuredImageUrl: f.featuredImageUrl || null,
        featuredImageAlt: f.featuredImageAlt || null,
        seoTitle: f.seoTitle || null,
        seoDescription: f.seoDescription || null,
        ogTitle: f.ogTitle || null,
        ogDescription: f.ogDescription || null,
        ogImageUrl: f.ogImageUrl || null,
        canonicalUrl: f.canonicalUrl || null,
        noindex: f.noindex,
        nofollow: f.nofollow,
        guestAuthorName: f.guestAuthorName || null,
        primaryCategoryId: f.primaryCategoryId || null,
        publishedAt: f.publishedAt ? new Date(f.publishedAt).toISOString() : null,
        tagIds: f.tagIds,
        authorIds: f.authorIds,
        saveType,
      };
    },
    [],
  );

  const applySaved = useCallback((data: PostDetail) => {
    setPost(data);
    setForm((prev) => ({
      ...prev,
      slug: data.slug,
      status: data.status,
      publishedAt: toDatetimeLocal(data.publishedAt),
    }));
    localStorage.removeItem(draftKey(activeIdRef.current));
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    const id = activeIdRef.current;
    try {
      const res = id
        ? await fetch(`/api/cms/posts/${id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(buildBody("autosave")),
          })
        : await fetch("/api/cms/posts", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(buildBody("autosave")),
          });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setLockInfo({ lockedBy: data.lockedBy ?? "another editor" });
        return false;
      }
      if (!id) {
        setActiveId(data.id);
        activeIdRef.current = data.id;
        window.history.replaceState(null, "", `/dashboard/cms/posts/${data.id}/edit`);
        setPost(data);
        setForm((prev) => ({ ...prev, slug: data.slug, slugTouched: true }));
        localStorage.removeItem(draftKey(null));
        localStorage.setItem(
          draftKey(data.id),
          JSON.stringify({ savedAt: new Date().toISOString(), form: formRef.current }),
        );
        toast.success("Draft created");
        return true;
      }
      applySaved(data);
      return true;
    } catch {
      return false;
    }
  }, [applySaved, buildBody]);

  const autosave = useAutosave(save, CMS_CONFIG.autosaveIntervalMs, !readonly);
  const { markDirty } = autosave;

  const update = useCallback(
    (patch: Partial<PostFormState>) => {
      setForm((prev) => {
        const next = { ...prev, ...patch };
        if (patch.title !== undefined && !prev.slugTouched && !("slug" in patch)) {
          next.slug = slugify(patch.title);
        }
        try {
          localStorage.setItem(
            draftKey(activeIdRef.current),
            JSON.stringify({ savedAt: new Date().toISOString(), form: next }),
          );
        } catch {
          // storage full/unavailable — auto-save to server still applies
        }
        return next;
      });
      markDirty();
    },
    [markDirty],
  );

  const saveManual = useCallback(async () => {
    const id = activeIdRef.current;
    if (!id) {
      await autosave.flush();
      return;
    }
    const res = await fetch(`/api/cms/posts/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildBody("manual")),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Save failed");
      return;
    }
    applySaved(data);
    localStorage.removeItem(draftKey(id));
    autosave.clearDirty();
    toast.success("Saved — revision snapshot created");
  }, [applySaved, autosave, buildBody]);

  // Cmd/Ctrl+S saves manually
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveManual();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveManual]);

  // --- soft-lock heartbeat ----------------------------------------------------
  useEffect(() => {
    if (!activeId) return;
    let stopped = false;
    const beat = async () => {
      try {
        const res = await fetch(`/api/cms/posts/${activeId}/lock`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "acquire" }),
        });
        if (stopped) return;
        if (res.status === 409) {
          const data = await res.json();
          setLockInfo({ lockedBy: data.lockedBy ?? "another editor" });
        } else {
          setLockInfo(null);
        }
      } catch {
        // network hiccup — next heartbeat retries
      }
    };
    void beat();
    const timer = setInterval(() => {
      if (!document.hidden) void beat();
    }, 30_000);
    const release = () => {
      void fetch(`/api/cms/posts/${activeId}/lock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "release" }),
        keepalive: true,
      });
    };
    window.addEventListener("beforeunload", release);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("beforeunload", release);
      release();
    };
  }, [activeId]);

  // --- image drop → upload → markdown -----------------------------------------
  const handleFilesDrop = useCallback(async (files: File[]) => {
    for (const file of files) {
      const body = new FormData();
      body.set("file", file);
      body.set("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      const res = await fetch("/api/cms/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        continue;
      }
      const markdown = `![${data.altText ?? file.name}](${data.url})`;
      setForm((prev) => ({
        ...prev,
        contentBody: prev.contentBody ? `${prev.contentBody}\n${markdown}\n` : `${markdown}\n`,
      }));
      markDirty();
      toast.success("Image uploaded");
    }
  }, [markDirty]);

  const restoreRecovery = () => {
    if (recovery) {
      setForm(recovery.form);
      markDirty();
      toast.info("Recovered local draft");
    }
    setRecovery(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <CircleNotch className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            render={<Link href="/dashboard/cms/posts" aria-label="Back to posts" />}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <input
            value={form.title}
            readOnly={readonly}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Post title…"
            className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50"
          />
          {post && <Badge variant="secondary">{post.status.replace("_", " ")}</Badge>}
        </div>

        {lockInfo && (
          <p className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
            <LockSimple className="size-4 shrink-0" />
            {lockInfo.lockedBy === currentUserId
              ? "You are editing this post in another tab."
              : `Another editor (${lockInfo.lockedBy}) is modifying this draft — editing is disabled to prevent overwrites.`}
          </p>
        )}

        {recovery && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 p-2.5 text-xs">
            <span className="flex items-center gap-2">
              <Warning className="size-4" />
              Unsaved local draft from {new Date(recovery.savedAt).toLocaleString("en-US")} found.
            </span>
            <span className="flex gap-2">
              <Button size="xs" variant="outline" onClick={restoreRecovery}>
                Restore
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setRecovery(null)}>
                Discard
              </Button>
            </span>
          </div>
        )}

        <div className="h-[calc(100dvh-16rem)] min-h-[420px] overflow-hidden rounded-xl border bg-card">
          <BlockTextEditor
            content={form.contentBody}
            onUpdateContent={(md) => update({ contentBody: md ?? "" })}
            onFilesDrop={readonly ? undefined : handleFilesDrop}
            emptyStateCopy={{
              title: "Start writing",
              description:
                "Add sections from the menu below, or drop images to embed them — content is stored as markdown.",
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {autosave.saving
              ? "Saving…"
              : autosave.error
                ? autosave.error
                : autosave.lastSavedAt
                  ? `Auto-saved at ${autosave.lastSavedAt.toLocaleTimeString("en-US")}`
                  : "All changes auto-save every 10 seconds"}
          </span>
          <span className="flex items-center gap-2">
            {autosave.dirty && <span>Unsaved changes</span>}
            <Button size="sm" variant="outline" disabled={readonly} onClick={() => void saveManual()}>
              Save
            </Button>
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="settings">
            <TabsList className="w-full">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="publish">Publish</TabsTrigger>
              <TabsTrigger value="revisions" disabled={!activeId}>
                Revisions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="pt-4">
              <SettingsPanel form={form} update={update} role={role} />
            </TabsContent>
            <TabsContent value="seo" className="pt-4">
              <SeoPanel form={form} update={update} editorLevel={editorLevel} />
            </TabsContent>
            <TabsContent value="publish" className="pt-4">
              <PublishPanel
                form={form}
                postId={activeId}
                role={role}
                update={update}
                onStatusChanged={(status, publishedAt) => {
                  setForm((prev) => ({
                    ...prev,
                    status,
                    publishedAt: toDatetimeLocal(publishedAt),
                  }));
                  autosave.clearDirty();
                  void fetch(`/api/cms/posts/${activeId}`)
                    .then((r) => (r.ok ? r.json() : null))
                    .then((d: PostDetail | null) => d && setPost(d))
                    .catch(() => undefined);
                }}
                onSaveDraft={async () => {
                  await autosave.flush();
                  return true;
                }}
              />
            </TabsContent>
            <TabsContent value="revisions" className="pt-4">
              {activeId && (
                <RevisionsPanel
                  postId={activeId}
                  current={post ?? { ...({} as PostDetail), contentBody: form.contentBody }}
                  onRolledBack={(data) => {
                    setPost(data);
                    setForm({ ...formFromPost(data), slugTouched: true });
                  }}
                  canEdit={!readonly && (editorLevel || post?.createdBy === currentUserId)}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
