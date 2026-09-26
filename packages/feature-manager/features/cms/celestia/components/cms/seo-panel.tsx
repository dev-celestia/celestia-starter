"use client";

import { Input, Label, Switch, Textarea } from "@celestia-project/ui";
import { CMS_CONFIG } from "@/lib/cms/config";
import type { PostFormState } from "./types";
import { SocialPreview } from "./social-preview";

function CharCounter({ value, range }: { value: string; range: readonly [number, number] }) {
  const [min, max] = range;
  const len = value.length;
  const tone =
    len === 0
      ? "text-muted-foreground"
      : len >= min && len <= max
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-amber-600 dark:text-amber-400";
  return (
    <span className={`text-[11px] tabular-nums ${tone}`}>
      {len} chars — recommended {min}–{max}
    </span>
  );
}

/** Technical & social SEO controls (PRD 3.4) — editors and admins only. */
export function SeoPanel({
  form,
  update,
  editorLevel,
}: {
  form: PostFormState;
  update: (patch: Partial<PostFormState>) => void;
  editorLevel: boolean;
}) {
  if (!editorLevel) {
    return (
      <p className="text-sm text-muted-foreground">
        SEO controls are available to editors and admins.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-1.5">
        <Label htmlFor="seo-title">SEO title</Label>
        <Input
          id="seo-title"
          value={form.seoTitle}
          onChange={(e) => update({ seoTitle: e.target.value })}
          placeholder={form.title || "Custom search result title"}
        />
        <CharCounter value={form.seoTitle} range={CMS_CONFIG.seoTitleRange} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="seo-description">Meta description</Label>
        <Textarea
          id="seo-description"
          value={form.seoDescription}
          onChange={(e) => update({ seoDescription: e.target.value })}
          placeholder="Shown under the title in search results and social cards"
          rows={3}
        />
        <CharCounter value={form.seoDescription} range={CMS_CONFIG.seoDescriptionRange} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="canonical-url">Canonical URL override</Label>
        <Input
          id="canonical-url"
          value={form.canonicalUrl}
          onChange={(e) => update({ canonicalUrl: e.target.value })}
          placeholder="https://source.example.com/original-article"
        />
        <p className="text-[11px] text-muted-foreground">
          Use for syndicated articles that point back to the original source.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="og-title">Social title (OG)</Label>
        <Input
          id="og-title"
          value={form.ogTitle}
          onChange={(e) => update({ ogTitle: e.target.value })}
          placeholder={form.seoTitle || form.title || "Defaults to the SEO title"}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="og-description">Social description (OG)</Label>
        <Textarea
          id="og-description"
          value={form.ogDescription}
          onChange={(e) => update({ ogDescription: e.target.value })}
          placeholder="Defaults to the meta description"
          rows={2}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="og-image">Social image (OG)</Label>
        <Input
          id="og-image"
          value={form.ogImageUrl}
          onChange={(e) => update({ ogImageUrl: e.target.value })}
          placeholder="/uploads/… or https://…"
        />
        <p className="text-[11px] text-muted-foreground">
          Defaults to the featured image. Recommended 1200×630.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border p-3">
        <p className="text-sm font-medium">Robots directives</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm">noindex</p>
            <p className="text-xs text-muted-foreground">Keep this post out of search engines</p>
          </div>
          <Switch
            checked={form.noindex}
            onCheckedChange={(v) => update({ noindex: v === true })}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm">nofollow</p>
            <p className="text-xs text-muted-foreground">Don&apos;t follow links from this post</p>
          </div>
          <Switch
            checked={form.nofollow}
            onCheckedChange={(v) => update({ nofollow: v === true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Social preview</p>
        <SocialPreview
          title={form.ogTitle || form.seoTitle || form.title}
          description={form.ogDescription || form.seoDescription || form.excerpt}
          imageUrl={form.ogImageUrl || form.featuredImageUrl}
          slug={form.slug}
        />
      </div>
    </div>
  );
}
