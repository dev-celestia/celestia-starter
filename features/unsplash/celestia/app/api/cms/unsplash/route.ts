import {
  listUnsplashPhotos,
  searchUnsplashPhotos,
  UnsplashError,
} from "@/lib/media/unsplash";
import { requireCmsSession } from "@/lib/cms/rbac";

const MAX_PER_PAGE = 30;

/** Unsplash proxy for the CMS media picker — search (`?q=`) or browse latest. */
export async function GET(request: Request) {
  try {
    await requireCmsSession();
  } catch (e) {
    return e as Response;
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Number(url.searchParams.get("per_page") ?? "24") || 24));

  try {
    const result = q
      ? await searchUnsplashPhotos(q, page, perPage)
      : await listUnsplashPhotos(page, perPage);
    return Response.json(result);
  } catch (e) {
    if (e instanceof UnsplashError) {
      return Response.json({ error: e.message }, { status: e.status });
    }
    return Response.json({ error: "Failed to reach Unsplash" }, { status: 502 });
  }
}
