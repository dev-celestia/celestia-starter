"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleNotch, UploadSimple, Copy } from "@phosphor-icons/react";
import {
  Button,
  Card,
  CardContent,
  Input,
} from "@celestia-project/ui";
import { useSession } from "@/lib/auth-client";
import { MediaDeleteButton } from "@/components/cms/media-dialog";
import type { MediaAsset } from "@/components/cms/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Media library (PRD 3.1): uploads, alt text, responsive WebP variants. */
export default function MediaPage() {
  const { data: session } = useSession();
  const canDelete = session?.user.role === "admin" || session?.user.role === "editor";

  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    fetch("/api/cms/media")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setAssets(d.assets ?? []))
      .catch((e) => {
        toast.error(String(e.message));
        setAssets([]);
      });
  }, []);

  useEffect(load, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set("file", file);
        body.set("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
        const res = await fetch("/api/cms/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
      }
      toast.success("Upload complete");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveAlt = async (asset: MediaAsset) => {
    const altText = altDrafts[asset.id];
    if (altText === undefined) return;
    const res = await fetch(`/api/cms/media/${asset.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ altText }),
    });
    if (!res.ok) {
      toast.error("Could not save alt text");
      return;
    }
    toast.success("Alt text saved");
    load();
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media library</h1>
          <p className="text-sm text-muted-foreground">
            Uploads are converted to WebP with responsive variants.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
          {uploading ? <CircleNotch className="size-4 animate-spin" /> : <UploadSimple className="size-4" />}
          Upload
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => void upload(e.target.files)}
          />
        </label>
      </div>

      {assets === null ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          <CircleNotch className="mx-auto size-4 animate-spin" />
        </p>
      ) : assets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No media yet — upload your first image.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/uploads/${asset.filename}`}
                alt={asset.altText ?? asset.originalName}
                className="h-40 w-full bg-muted object-cover"
              />
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{asset.originalName}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {asset.width}×{asset.height} · {formatBytes(asset.bytes)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={altDrafts[asset.id] ?? asset.altText ?? ""}
                    onChange={(e) => setAltDrafts({ ...altDrafts, [asset.id]: e.target.value })}
                    onBlur={() => void saveAlt(asset)}
                    placeholder="Alt text…"
                    className="h-8 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Copy URL"
                    onClick={() => {
                      void navigator.clipboard.writeText(`/uploads/${asset.filename}`);
                      toast.success("URL copied");
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                  {canDelete && (
                    <MediaDeleteButton id={asset.id} onDeleted={load} />
                  )}
                </div>
                {asset.variants && asset.variants.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Variants: {asset.variants.map((v) => `${v.width}w`).join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
