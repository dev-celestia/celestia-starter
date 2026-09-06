"use client";

import { useState } from "react";
import { Globe } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@celestia-project/ui";
import { siteUrl } from "@/lib/cms/config";

/**
 * Live Open Graph / Twitter card preview (PRD 3.4) with desktop and mobile
 * variants. Falls back through og → seo → post fields, like search engines do.
 */
export function SocialPreview({
  title,
  description,
  imageUrl,
  slug,
  siteName = "Celestia",
}: {
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  siteName?: string;
}) {
  const [variant, setVariant] = useState("desktop");
  const displayUrl = slug ? `${siteUrl().replace(/^https?:\/\//, "")}/blog/${slug}` : siteUrl().replace(/^https?:\/\//, "");

  const card = (compact: boolean) => (
    <div
      className={
        compact
          ? "w-full max-w-[340px] overflow-hidden rounded-xl border bg-card"
          : "w-full overflow-hidden rounded-xl border bg-card"
      }
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className={compact ? "h-32 w-full object-cover" : "h-44 w-full object-cover"} />
      ) : (
        <div className="flex h-32 items-center justify-center bg-muted text-xs text-muted-foreground">
          No OG image set
        </div>
      )}
      <div className="space-y-1 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{displayUrl}</p>
        <p className="line-clamp-1 text-sm font-semibold">{title || "Untitled post"}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {description || "No description set — the excerpt or opening paragraphs will be used."}
        </p>
      </div>
    </div>
  );

  return (
    <Tabs value={variant} onValueChange={setVariant}>
      <TabsList>
        <TabsTrigger value="desktop">
          <Globe className="size-3.5" /> Desktop
        </TabsTrigger>
        <TabsTrigger value="mobile">Mobile</TabsTrigger>
      </TabsList>
      <TabsContent value="desktop" className="pt-3">
        {card(false)}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Google search result shows: <span className="text-foreground">{title || "Untitled post"}</span>
        </p>
      </TabsContent>
      <TabsContent value="mobile" className="pt-3">
        <div className="flex justify-center">{card(true)}</div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Twitter/X card uses the same OG tags — {siteName}
        </p>
      </TabsContent>
    </Tabs>
  );
}
