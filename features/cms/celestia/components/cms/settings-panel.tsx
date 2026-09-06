"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "@phosphor-icons/react";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@celestia-project/ui";
import { slugify } from "@/lib/cms/slugify";
import type { Category, PostFormState, TagRef } from "./types";
import { MediaDialog } from "./media-dialog";

interface SettingsPanelProps {
  form: PostFormState;
  update: (patch: Partial<PostFormState>) => void;
  role: string | null | undefined;
}

/** Build "Parent › Child" display names for the hierarchical category picker. */
function categoryLabel(categories: Category[], id: string): string {
  let current = categories.find((c) => c.id === id);
  const parts: string[] = [];
  const seen = new Set<string>();
  while (current && !seen.has(current.id) && parts.length < 3) {
    seen.add(current.id);
    parts.unshift(current.name);
    current = current.parentId ? categories.find((c) => c.id === current!.parentId) : undefined;
  }
  return parts.join(" › ");
}

/** Post settings (PRD 3.3): slug, excerpt, featured image, categories, tags, bylines. */
export function SettingsPanel({ form, update, role }: SettingsPanelProps) {
  const editorLevel = role === "admin" || role === "editor";
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagRef[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TagRef[]>([]);
  const [byline, setByline] = useState<{ id: string; name: string; image: string | null }[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/cms/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
    fetch("/api/cms/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags ?? []))
      .catch(() => setTags([]));
    if (editorLevel) {
      fetch("/api/cms/authors")
        .then((r) => r.json())
        .then((d) => setByline(d.users ?? []))
        .catch(() => setByline([]));
    }
  }, [editorLevel]);

  // tag autocomplete (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!tagQuery.trim()) {
        setSuggestions([]);
        return;
      }
      fetch(`/api/cms/tags?q=${encodeURIComponent(tagQuery.trim())}`)
        .then((r) => r.json())
        .then((d) => setSuggestions((d.tags ?? []).filter((t: TagRef) => !form.tagIds.includes(t.id))))
        .catch(() => setSuggestions([]));
    }, 200);
  }, [tagQuery, form.tagIds]);

  const selectedTags = useMemo(
    () => form.tagIds.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as TagRef[],
    [form.tagIds, tags],
  );

  const addTag = async (tag: TagRef) => {
    update({ tagIds: [...form.tagIds, tag.id] });
    setTagQuery("");
    setSuggestions([]);
  };

  const createTag = async () => {
    const name = tagQuery.trim();
    if (!name) return;
    const res = await fetch("/api/cms/tags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not create tag");
      return;
    }
    if (!tags.some((t) => t.id === data.id)) setTags((prev) => [...prev, data]);
    update({ tagIds: [...form.tagIds, data.id] });
    setTagQuery("");
    setSuggestions([]);
  };

  const toggleByline = (userId: string) => {
    const next = form.authorIds.includes(userId)
      ? form.authorIds.filter((id) => id !== userId)
      : [...form.authorIds, userId];
    update({ authorIds: next });
  };

  const categoryItems: Record<string, string> = { "": "No category" };
  for (const c of categories) categoryItems[c.id] = categoryLabel(categories, c.id);

  const slugEditable = !["published", "scheduled", "archived"].includes(form.status);

  return (
    <div className="space-y-5">
      <div className="grid gap-1.5">
        <Label htmlFor="post-slug">Slug</Label>
        <div className="flex gap-2">
          <Input
            id="post-slug"
            value={form.slug}
            disabled={!slugEditable}
            onChange={(e) => update({ slug: e.target.value, slugTouched: true })}
          />
          <button
            type="button"
            disabled={!slugEditable}
            className="shrink-0 rounded-md border px-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            onClick={() => update({ slug: slugify(form.title), slugTouched: false })}
          >
            Regenerate
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {slugEditable
            ? "Editable until publication. After publication, changes create a 301 redirect."
            : "Locked after publication — edits generate a 301 redirect."}
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="post-excerpt">Excerpt</Label>
        <Textarea
          id="post-excerpt"
          value={form.excerpt}
          onChange={(e) => update({ excerpt: e.target.value })}
          placeholder="Short summary used in listings, RSS, and as meta description fallback"
          rows={3}
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Featured image</Label>
        {form.featuredImageUrl ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.featuredImageUrl}
              alt={form.featuredImageAlt || "Featured image"}
              className="h-36 w-full rounded-lg border object-cover"
            />
            <Input
              value={form.featuredImageAlt}
              onChange={(e) => update({ featuredImageAlt: e.target.value })}
              placeholder="Alt text (required for publishing)"
            />
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => update({ featuredImageUrl: "", featuredImageAlt: "" })}
            >
              Remove image
            </button>
          </div>
        ) : (
          <MediaDialog
            onSelect={({ url }) => update({ featuredImageUrl: url })}
            trigger={
              <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                <Plus className="size-4" /> Set featured image
              </span>
            }
          />
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>Primary category</Label>
        <Select
          value={form.primaryCategoryId}
          items={categoryItems}
          onValueChange={(v) => update({ primaryCategoryId: v ?? "" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryItems).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          The primary category drives the canonical URL route.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="post-tags">Tags</Label>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
              >
                {tag.name}
                <button
                  type="button"
                  aria-label={`Remove ${tag.name}`}
                  onClick={() => update({ tagIds: form.tagIds.filter((id) => id !== tag.id) })}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <Input
            id="post-tags"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Search existing tags…"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
              {suggestions.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className="block w-full px-3 py-1.5 text-start text-sm hover:bg-muted"
                  onClick={() => void addTag(tag)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {editorLevel && tagQuery.trim() && suggestions.length === 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={() => void createTag()}
          >
            <Plus className="size-3" /> Create tag “{tagQuery.trim()}”
          </button>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="guest-author">Guest contributor</Label>
        <Input
          id="guest-author"
          value={form.guestAuthorName}
          onChange={(e) => update({ guestAuthorName: e.target.value })}
          placeholder="External author name (optional)"
        />
      </div>

      {editorLevel && byline.length > 0 && (
        <div className="grid gap-1.5">
          <Label>Multi-author byline</Label>
          <div className="flex flex-wrap gap-1.5">
            {byline.map((user) => {
              const active = form.authorIds.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleByline(user.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {user.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
