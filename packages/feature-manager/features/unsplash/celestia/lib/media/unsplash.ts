/** Unsplash REST API client — server-only. The access key never reaches the browser. */

const UNSPLASH_API = "https://api.unsplash.com";

/** Normalized photo shape returned to the CMS client. */
export interface UnsplashPhoto {
  id: string;
  /** ~1080w regular rendition — what gets inserted into content. */
  url: string;
  /** Small cropped rendition for the picker grid. */
  thumb: string;
  width: number;
  height: number;
  alt: string;
  color: string;
  photographer: string;
  photographerUrl: string;
  /** Photo page on unsplash.com (attribution link requirement). */
  unsplashUrl: string;
}

export interface UnsplashResult {
  photos: UnsplashPhoto[];
  total: number;
  /** null when the endpoint doesn't paginate by total pages (browse mode). */
  totalPages: number | null;
}

interface RawUnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  alt_description: string | null;
  description: string | null;
  urls: { raw: string; regular: string; small: string };
  user: { name: string; links: { html: string } };
  links: { html: string };
}

function normalize(photo: RawUnsplashPhoto): UnsplashPhoto {
  // imgix params work on the raw URL — crop the grid thumb for uniform tiles.
  const thumb = `${photo.urls.raw}&auto=format&fit=crop&w=400&h=300&q=70`;
  return {
    id: photo.id,
    url: photo.urls.regular,
    thumb,
    width: photo.width,
    height: photo.height,
    alt: photo.alt_description ?? photo.description ?? "",
    color: photo.color,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    unsplashUrl: photo.links.html,
  };
}

async function unsplashFetch(path: string, params: URLSearchParams): Promise<Response> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new UnsplashError("UNSPLASH_ACCESS_KEY is not configured", 503);
  }
  const res = await fetch(`${UNSPLASH_API}${path}?${params.toString()}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new UnsplashError("Unsplash rejected the access key", 502);
  }
  if (res.status === 403) {
    throw new UnsplashError("Unsplash rate limit exceeded", 429);
  }
  if (!res.ok) {
    throw new UnsplashError(`Unsplash request failed (${res.status})`, 502);
  }
  return res;
}

export class UnsplashError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "UnsplashError";
  }
}

/** Keyword search via /search/photos. */
export async function searchUnsplashPhotos(
  query: string,
  page: number,
  perPage: number,
): Promise<UnsplashResult> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
    content_type: "photo",
  });
  const res = await unsplashFetch("/search/photos", params);
  const data = (await res.json()) as {
    total: number;
    total_pages: number;
    results: RawUnsplashPhoto[];
  };
  return {
    photos: data.results.map(normalize),
    total: data.total,
    totalPages: data.total_pages,
  };
}

/** Browse-mode listing (no query) via /photos. */
export async function listUnsplashPhotos(page: number, perPage: number): Promise<UnsplashResult> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    order_by: "latest",
  });
  const res = await unsplashFetch("/photos", params);
  const data = (await res.json()) as RawUnsplashPhoto[];
  return { photos: data.map(normalize), total: data.length, totalPages: null };
}
