import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

export interface TocItem {
  id: string
  title: string
  level: number
}

export interface DocMetadata {
  title: string
  description?: string
  icon?: string
  full?: boolean
}

export interface DocPage {
  slug: string[]
  slugString: string
  filePath: string
  meta: DocMetadata
  content: string
  toc: TocItem[]
}

export interface NavLink {
  title: string
  slug: string
  href: string
  description?: string
  icon?: string
}

export interface NavGroup {
  name: string
  items: NavLink[]
}

const DOCS_DIRECTORY = path.join(process.cwd(), "content/docs")

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const toc: TocItem[] = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(content)) !== null) {
    const rawLevel = match[1]
    const rawTitle = match[2]
    if (rawLevel && rawTitle) {
      const level = rawLevel.length
      const title = rawTitle.trim().replace(/`|\*/g, "")
      const id = slugify(title)
      toc.push({ id, title, level })
    }
  }

  return toc
}

export function getAllDocFiles(dir: string = DOCS_DIRECTORY, base: string = ""): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = base ? `${base}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      files = files.concat(getAllDocFiles(fullPath, relPath))
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(relPath)
    }
  }

  return files
}

export function getDocBySlug(slugs: string[] = []): DocPage | null {
  // If slug is empty or ['index'], return root index.mdx
  let relPath = ""
  if (slugs.length === 0) {
    relPath = "index.mdx"
  } else {
    const potentialPath = slugs.join("/")
    if (fs.existsSync(path.join(DOCS_DIRECTORY, `${potentialPath}.mdx`))) {
      relPath = `${potentialPath}.mdx`
    } else if (fs.existsSync(path.join(DOCS_DIRECTORY, potentialPath, "index.mdx"))) {
      relPath = `${potentialPath}/index.mdx`
    } else {
      return null
    }
  }

  const fullPath = path.join(DOCS_DIRECTORY, relPath)
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  const meta: DocMetadata = {
    title: data.title || (slugs.length > 0 ? slugs[slugs.length - 1] : "Docs"),
    description: data.description || "",
    icon: data.icon,
    full: data.full || false,
  }

  const toc = extractToc(content)
  const slugString = slugs.join("/")

  return {
    slug: slugs,
    slugString,
    filePath: relPath,
    meta,
    content,
    toc,
  }
}

export function getAllDocSlugs(): { slug: string[] }[] {
  const files = getAllDocFiles()
  const params: { slug: string[] }[] = []

  for (const file of files) {
    const clean = file.replace(/\.mdx$/, "")
    if (clean === "index") {
      params.push({ slug: [] })
    } else if (clean.endsWith("/index")) {
      params.push({ slug: clean.replace(/\/index$/, "").split("/") })
    } else {
      params.push({ slug: clean.split("/") })
    }
  }

  return params
}

export function getDocsNavigation(): NavGroup[] {
  const rootMetaPath = path.join(DOCS_DIRECTORY, "meta.json")
  const groups: NavGroup[] = []

  let rootPages: string[] = []
  if (fs.existsSync(rootMetaPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(rootMetaPath, "utf8"))
      rootPages = parsed.pages || []
    } catch {
      rootPages = []
    }
  }

  let currentGroupName = "Overview"
  let currentGroupItems: NavLink[] = []

  for (const item of rootPages) {
    if (item.startsWith("---") && item.endsWith("---")) {
      if (currentGroupItems.length > 0) {
        groups.push({ name: currentGroupName, items: currentGroupItems })
        currentGroupItems = []
      }
      currentGroupName = item.replace(/^---+|---+$/g, "").trim()
      continue
    }

    // Check if item is a subfolder with its own meta.json (e.g., "components", "libs/nuclei-run")
    const subMetaPath = path.join(DOCS_DIRECTORY, item, "meta.json")
    if (fs.existsSync(subMetaPath)) {
      let subPages: string[] = []
      let subMetaTitle = ""
      try {
        const parsed = JSON.parse(fs.readFileSync(subMetaPath, "utf8"))
        subPages = parsed.pages || []
        subMetaTitle = parsed.title || ""
      } catch {
        subPages = []
      }

      // Add Subfolder Overview first if present
      const itemSlugs = item.split("/")
      const overviewDoc = getDocBySlug(itemSlugs)
      currentGroupItems.push({
        title: overviewDoc?.meta.title || subMetaTitle || item,
        slug: item,
        href: `/docs/${item}`,
        description: overviewDoc?.meta.description,
        icon: overviewDoc?.meta.icon,
      })

      if (currentGroupItems.length > 0) {
        groups.push({ name: currentGroupName, items: currentGroupItems })
        currentGroupItems = []
      }

      // Add subfolder pages grouped by category headers
      let subGroupName = subMetaTitle ? `${subMetaTitle}` : (item.charAt(0).toUpperCase() + item.slice(1))
      let subItems: NavLink[] = []

      for (const subSlug of subPages) {
        if (subSlug === "index") continue
        if (subSlug.startsWith("---") && subSlug.endsWith("---")) {
          if (subItems.length > 0) {
            groups.push({ name: subGroupName, items: subItems })
            subItems = []
          }
          const rawHeader = subSlug.replace(/^---+|---+$/g, "").trim()
          subGroupName = subMetaTitle ? `${subMetaTitle}: ${rawHeader}` : rawHeader
          continue
        }

        const doc = getDocBySlug([...itemSlugs, subSlug])
        subItems.push({
          title: doc?.meta.title || subSlug,
          slug: `${item}/${subSlug}`,
          href: `/docs/${item}/${subSlug}`,
          description: doc?.meta.description,
          icon: doc?.meta.icon,
        })
      }

      if (subItems.length > 0) {
        groups.push({
          name: subGroupName,
          items: subItems,
        })
      }
      currentGroupName = "More"
      continue
    }

    // Normal root page
    const slugArray = item === "index" ? [] : [item]
    const doc = getDocBySlug(slugArray)
    currentGroupItems.push({
      title: doc?.meta.title || item,
      slug: item === "index" ? "" : item,
      href: item === "index" ? "/docs" : `/docs/${item}`,
      description: doc?.meta.description,
      icon: doc?.meta.icon,
    })
  }

  if (currentGroupItems.length > 0) {
    groups.push({ name: currentGroupName, items: currentGroupItems })
  }

  return groups
}

export function getDocPagination(currentSlugString: string): {
  prev: NavLink | null
  next: NavLink | null
} {
  const nav = getDocsNavigation()
  const allItems: NavLink[] = []
  for (const group of nav) {
    allItems.push(...group.items)
  }

  const currentIndex = allItems.findIndex((item) => {
    if (currentSlugString === "" && item.slug === "") return true
    return item.slug === currentSlugString
  })

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  const prev = currentIndex > 0 ? (allItems[currentIndex - 1] ?? null) : null
  const next = currentIndex < allItems.length - 1 ? (allItems[currentIndex + 1] ?? null) : null

  return { prev, next }
}
