import fs from "node:fs"
import path from "node:path"
import { getDocBySlug, type DocPage, type NavGroup, type NavLink } from "./docs"

const NUCLEI_DOCS_DIR = path.join(process.cwd(), "content/docs/libs/nuclei-run")

export function getNucleiRunDoc(slugs: string[] = []): DocPage | null {
  if (slugs.length === 0 || (slugs.length === 1 && slugs[0] === "index")) {
    return getDocBySlug(["libs", "nuclei-run"])
  }
  return getDocBySlug(["libs", "nuclei-run", ...slugs])
}

export function getNucleiRunDocSlugs(): { slug: string[] }[] {
  const metaPath = path.join(NUCLEI_DOCS_DIR, "meta.json")
  const slugs: { slug: string[] }[] = [{ slug: [] }]

  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"))
      const pages: string[] = meta.pages || []
      for (const p of pages) {
        if (!p.startsWith("---") && p !== "index") {
          slugs.push({ slug: [p] })
        }
      }
      return slugs
    } catch {
      // Fallback below
    }
  }

  if (fs.existsSync(NUCLEI_DOCS_DIR)) {
    const files = fs.readdirSync(NUCLEI_DOCS_DIR)
    for (const f of files) {
      if (f.endsWith(".mdx") && f !== "index.mdx") {
        slugs.push({ slug: [f.replace(/\.mdx$/, "")] })
      }
    }
  }

  return slugs
}

export function getNucleiRunNavigation(basePath: string = "/nuclei-run"): NavGroup[] {
  const metaPath = path.join(NUCLEI_DOCS_DIR, "meta.json")
  const groups: NavGroup[] = []

  let pages: string[] = []
  if (fs.existsSync(metaPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(metaPath, "utf8"))
      pages = parsed.pages || []
    } catch {
      pages = []
    }
  }

  let currentGroupName = "Overview"
  let currentGroupItems: NavLink[] = []

  // Add index/overview first
  const indexDoc = getNucleiRunDoc([])
  currentGroupItems.push({
    title: "Overview & Index",
    slug: "",
    href: basePath,
    description: indexDoc?.meta.description || "nuclei-run documentation overview",
    icon: "shield",
  })

  for (const item of pages) {
    if (item === "index") continue

    if (item.startsWith("---") && item.endsWith("---")) {
      if (currentGroupItems.length > 0) {
        groups.push({ name: currentGroupName, items: currentGroupItems })
        currentGroupItems = []
      }
      currentGroupName = item.replace(/^---+|---+$/g, "").trim()
      continue
    }

    const doc = getNucleiRunDoc([item])
    currentGroupItems.push({
      title: doc?.meta.title || item.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      slug: item,
      href: `${basePath}/${item}`,
      description: doc?.meta.description,
      icon: doc?.meta.icon,
    })
  }

  if (currentGroupItems.length > 0) {
    groups.push({ name: currentGroupName, items: currentGroupItems })
  }

  return groups
}

export function getNucleiRunPagination(
  currentSlugString: string,
  basePath: string = "/nuclei-run"
): {
  prev: NavLink | null
  next: NavLink | null
} {
  const nav = getNucleiRunNavigation(basePath)
  const allItems: NavLink[] = []
  for (const group of nav) {
    allItems.push(...group.items)
  }

  const currentIndex = allItems.findIndex((item) => {
    if ((currentSlugString === "" || currentSlugString === "index") && item.slug === "") return true
    return item.slug === currentSlugString
  })

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  const prev = currentIndex > 0 ? (allItems[currentIndex - 1] ?? null) : null
  const next = currentIndex < allItems.length - 1 ? (allItems[currentIndex + 1] ?? null) : null

  return { prev, next }
}
