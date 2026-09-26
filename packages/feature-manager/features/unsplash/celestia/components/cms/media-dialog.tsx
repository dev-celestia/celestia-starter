"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleNotch, UploadSimple, Trash } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "./types";
import { UnsplashPicker } from "./unsplash-picker";

/**
 * Media picker: upload a new image (goes through /api/cms/upload → WebP), pick
 * an existing asset from the library, or search Unsplash. Returns the public
 * URL + alt text.
 */
export function MediaDialog({
  onSelect,
  trigger,
  title = "Media library",
}: {
  onSelect: (asset: { url: string; altText: string }) => void;
  trigger?: React.ReactElement;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: { url: string; altText: string }[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set("file", file);
        body.set("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
        const res = await fetch("/api/cms/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        uploaded.push({ url: data.url, altText: data.altText ?? "" });
      }
      toast.success(`Uploaded ${uploaded.length} image${uploaded.length === 1 ? "" : "s"}`);
      load();
      if (uploaded[0]) {
        onSelect(uploaded[0]!);
        setOpen(false);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button variant="outline" size="sm">Choose image</Button>} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Upload a new image (converted to WebP), pick one from the library, or search Unsplash.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="library">
          <TabsList>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
          </TabsList>
          <TabsContent value="library">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                  {uploading ? (
                    <CircleNotch className="size-4 animate-spin" />
                  ) : (
                    <UploadSimple className="size-4" />
                  )}
                  Upload image
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
              <ScrollArea className="h-72">
                <div className="grid grid-cols-3 gap-3 pe-2">
                  {assets === null ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="overflow-hidden rounded-lg border" aria-busy="true">
                        <Skeleton className="h-24 w-full rounded-none" />
                        <Skeleton className="m-2 h-3 w-2/3" />
                      </div>
                    ))
                  ) : assets.length === 0 ? (
                    <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">
                      No media yet — upload your first image.
                    </p>
                  ) : (
                    assets.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => {
                          onSelect({ url: asset.url ?? `/uploads/${asset.filename}`, altText: asset.altText ?? "" });
                          setOpen(false);
                        }}
                        className={cn(
                          "group overflow-hidden rounded-lg border text-start transition-colors hover:border-primary/60",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url ?? `/uploads/${asset.filename}`}
                          alt={asset.altText ?? asset.originalName}
                          className="h-24 w-full object-cover"
                        />
                        <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">
                          {asset.originalName}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          <TabsContent value="unsplash">
            <UnsplashPicker
              onSelect={(pick) => {
                onSelect({ url: pick.url, altText: pick.altText });
                setOpen(false);
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/** Small inline delete used by the media library page. */
export function MediaDeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch(`/api/cms/media/${id}`, { method: "DELETE" });
        setBusy(false);
        if (!res.ok) {
          const d = await res.json();
          toast.error(d.error ?? "Delete failed");
          return;
        }
        toast.success("Asset deleted");
        onDeleted();
      }}
    >
      <Trash className="size-4" />
    </Button>
  );
}
