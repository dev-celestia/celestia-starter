"use client"

import * as React from "react"

import { Checkbox } from "@celestia-project/ui/primitive/checkbox"
import { Input } from "@celestia-project/ui/primitive/input"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export interface SearchFacetOption {
  id: string
  label: string
  count?: number
  checked?: boolean
}

export interface SearchFacet {
  id: string
  label: string
  options: SearchFacetOption[]
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  /** Supporting line — a path, an owner, a date. */
  meta?: string
  badge?: React.ReactNode
}

/**
 * `results` is omitted from the base props: `React.ComponentProps<"div">`
 * declares an HTML `results` attribute (a number, for `<input type="search">`),
 * and the two types are irreconcilable.
 */
export interface SearchPageProps extends Omit<
  PageShellProps,
  "children" | "results"
> {
  query: string
  onQueryChange: (value: string) => void
  placeholder?: string
  /** Filter rail. Hidden below `lg`, where the results need the full width. */
  facets?: SearchFacet[]
  onToggleFacet?: (facetId: string, optionId: string) => void
  results: SearchResult[]
  /** Caption above the results — "128 results in 0.4s". */
  totalLabel?: React.ReactNode
  onOpenResult?: (id: string) => void
}

/**
 * The search results screen: a query bar, a facet rail, and a result list.
 *
 * The query and the facet selection are both controlled. Search state is the
 * canonical thing a URL carries — a result page that cannot be linked to, or
 * restored on refresh, is not a result page — so keeping it here would put the
 * only copy of it inside a component that unmounts on navigation.
 */
function SearchPage({
  query,
  onQueryChange,
  placeholder = "Search…",
  facets,
  onToggleFacet,
  results,
  totalLabel,
  onOpenResult,
  ...shellProps
}: SearchPageProps) {
  return (
    <PageShell {...shellProps}>
      <div
        data-slot="search-page"
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label="Search"
          className="h-9 w-full"
        />

        <div className="flex min-h-0 flex-1 gap-6">
          {facets && facets.length > 0 && (
            <aside
              data-slot="search-page-facets"
              className="hidden w-48 shrink-0 flex-col gap-5 lg:flex"
            >
              {facets.map((facet) => (
                <div key={facet.id} className="flex flex-col gap-2">
                  <span className="text-3xs font-medium tracking-wide text-foreground uppercase">
                    {facet.label}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {facet.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Checkbox
                          checked={option.checked}
                          onCheckedChange={() =>
                            onToggleFacet?.(facet.id, option.id)
                          }
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                        {option.count != null && (
                          <span className="shrink-0 text-3xs text-muted-foreground/70 tabular-nums">
                            {option.count}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {totalLabel && (
              <span className="text-xs text-muted-foreground">
                {totalLabel}
              </span>
            )}

            <div className="flex flex-col gap-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onOpenResult?.(result.id)}
                  className="flex flex-col gap-1.5 rounded-xl border border-border/70 bg-card p-4 text-start transition-colors hover:border-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {result.title}
                    </span>
                    {result.badge}
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {result.excerpt}
                  </p>
                  {result.meta && (
                    <span className="truncate text-3xs text-muted-foreground/70">
                      {result.meta}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {results.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 px-6 py-14 text-center text-sm text-muted-foreground">
                No results for “{query}”.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

export { SearchPage }
