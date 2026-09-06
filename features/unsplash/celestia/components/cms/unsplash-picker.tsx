"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleNotch, MagnifyingGlass } from "@phosphor-icons/react";
import { Button, Input, ScrollArea, Skeleton } from "@celestia-project/ui";

/** Photo shape mirrored from the /api/cms/unsplash response. */
export interface UnsplashPhoto {
  id: string;
  url: string;
  thumb: string;
  width: number;
  height: number;
  alt: string;
  color: string;
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;
}

export interface UnsplashPick {
  url: string;
  altText: string;
  photographer: string;
  unsplashUrl: string;
}

interface UnsplashResponse {
  photos: UnsplashPhoto[];
  total: number;
  totalPages: number | null;
}

/**
 * Search and pick photos from Unsplash (via the server-side /api/cms/unsplash
 * proxy — the access key stays on the server). Returns the regular rendition
 * URL plus attribution fields for the insert.
 */
export function UnsplashPicker({
  onSelect,
  perPage = 24,
}: {
  onSelect: (pick: UnsplashPick) => void;
  perPage?: number;
}) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [photos, setPhotos] = useState<UnsplashPhoto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Debounce the search box so typing doesn't hammer the API.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Initial browse load + fresh searches.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: "1", per_page: String(perPage) });
    if (search) params.set("q", search);
    fetch(`/api/cms/unsplash?${params}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Failed to load");
        return d as UnsplashResponse;
      })
      .then((d) => {
        if (cancelled) return;
        setPhotos(d.photos);
        setPage(1);
        setHasMore(d.photos.length >= perPage && (d.totalPages === null || d.totalPages > 1));
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setPhotos([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, perPage]);

  const loadMore = useCallback(async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: String(next), per_page: String(perPage) });
      if (search) params.set("q", search);
      const r = await fetch(`/api/cms/unsplash?${params}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Failed to load");
      const data = d as UnsplashResponse;
      setPhotos((prev) => {
        const seen = new Set((prev ?? []).map((p) => p.id));
        return [...(prev ?? []), ...data.photos.filter((p) => !seen.has(p.id))];
      });
      setPage(next);
      setHasMore(data.photos.length >= perPage && (data.totalPages === null || next < data.totalPages));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoadingMore(false);
    }
  }, [page, perPage, search]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search row — distinct control, full width of the dialog body */}
      <div className="relative">
        <MagnifyingGlass className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Unsplash photos…"
          className="ps-9"
          aria-label="Search Unsplash photos"
        />
      </div>

      <ScrollArea className="h-72">
          <div className="grid grid-cols-3 gap-3 pe-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border" aria-busy="true">
                  <Skeleton className="h-24 w-full rounded-none" />
                  <Skeleton className="m-2 h-3 w-2/3" />
                </div>
              ))
            ) : error ? (
              <p className="col-span-3 py-8 text-center text-sm text-destructive">{error}</p>
            ) : photos && photos.length > 0 ? (
              photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() =>
                    onSelect({
                      url: photo.url,
                      altText: photo.alt || `Photo by ${photo.photographer} on Unsplash`,
                      photographer: photo.photographer,
                      unsplashUrl: photo.unsplashUrl,
                    })
                  }
                  className="group overflow-hidden rounded-lg border text-start transition-colors hover:border-primary/60"
                  title={photo.alt || `Photo by ${photo.photographer}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumb}
                    alt={photo.alt || `Photo by ${photo.photographer} on Unsplash`}
                    loading="lazy"
                    className="h-24 w-full object-cover"
                    style={{ backgroundColor: photo.color }}
                  />
                  <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">
                    {photo.photographer}
                  </p>
                </button>
              ))
            ) : (
              <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">
                {search ? `No photos found for “${search}”.` : "No photos available."}
              </p>
            )}
          </div>
        </ScrollArea>

      {/* Actions stay in normal flow so they never clip inside the scroll area */}
      <div className="flex items-center justify-between gap-3">
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Photos from Unsplash
        </a>
        {hasMore && !loading && (
          <Button variant="outline" size="sm" disabled={loadingMore} onClick={() => void loadMore()}>
            {loadingMore && <CircleNotch className="size-4 animate-spin" />}
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}
