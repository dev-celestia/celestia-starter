/** CMS runtime configuration. */
export const CMS_CONFIG = {
  /** What /blog/<old-slug> does for archived posts without a redirect. */
  archiveBehavior: "404" as "404" | "redirect",
  /** Uploads directory (relative to apps/celestia). */
  uploadDir: "public/uploads",
  /** Max original upload size in bytes (10 MB). */
  maxUploadBytes: 10 * 1024 * 1024,
  /** WebP master width (variants below this are also generated). */
  masterWidth: 1600,
  /** Responsive variant widths. */
  variantWidths: [1200, 640],
  /** Soft-lock freshness window. */
  lockTtlMs: 60_000,
  /** Auto-save debounce (PRD: every 10 seconds on change). */
  autosaveIntervalMs: 10_000,
  /** SEO char-count recommendations (PRD: 50–60 title, 150–160 description). */
  seoTitleRange: [50, 60] as const,
  seoDescriptionRange: [150, 160] as const,
};

/** Public site origin used for canonical URLs and social previews. */
export function siteUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3100";
}
