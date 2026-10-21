"use client"

import * as React from "react"
import { CheckIcon, FunnelSimpleIcon, XIcon } from "@phosphor-icons/react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Badge } from "@celestia-project/ui/primitive/badge"
import { Button } from "@celestia-project/ui/primitive/button"
import { Input } from "@celestia-project/ui/primitive/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@celestia-project/ui/primitive/popover"

const FilterBarContext = React.createContext(false)

export interface FilterChipProps extends React.ComponentProps<"button"> {
  /** Selected segment, or pressed toggle when the chip stands alone. */
  selected?: boolean
}

/**
 * A filter chip.
 *
 * Inside a {@link FilterBar} it is one segment of a single-choice track.
 * On its own it is a toggle pill — a search token or an independent facet.
 */
function FilterChip({
  selected = false,
  className,
  type = "button",
  tabIndex,
  ...props
}: FilterChipProps) {
  const segmented = React.useContext(FilterBarContext)

  return (
    <button
      type={type}
      data-slot="filter-chip"
      data-selected={selected ? "true" : "false"}
      role={segmented ? "radio" : undefined}
      aria-checked={segmented ? selected : undefined}
      aria-pressed={segmented ? undefined : selected}
      tabIndex={tabIndex ?? (segmented ? (selected ? 0 : -1) : undefined)}
      className={cn(
        "inline-flex h-6.5 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full border px-3 text-xs font-medium whitespace-nowrap select-none",
        "transition-[color,background-color,box-shadow,scale] duration-fast ease-out",
        "active:scale-[0.96] active:duration-instant motion-reduce:active:scale-100",
        "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        segmented
          ? selected
            ? "border-transparent bg-background text-foreground shadow-xs dark:border-input/40 dark:bg-input/30 dark:shadow-none"
            : "border-transparent bg-transparent text-muted-foreground hover:text-foreground"
          : selected
            ? "border-primary bg-primary/10 text-primary"
            : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        className
      )}
      {...props}
    />
  )
}

function isFilterChip(
  child: React.ReactNode
): child is React.ReactElement<FilterChipProps> {
  return React.isValidElement(child) && child.type === FilterChip
}

export interface FilterBarProps extends React.ComponentProps<"div"> {
  /** Actions that sit outside the chip track, at the end of the row. */
  trailing?: React.ReactNode
}

/**
 * Single-choice filter track.
 *
 * Chips share one muted rail, the same treatment as a segmented tab list.
 * Arrow keys move the selection. Trailing actions stay outside the rail.
 */
function FilterBar({
  className,
  children,
  trailing,
  "aria-label": ariaLabel = "Filters",
  ...props
}: FilterBarProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const anySelected = React.Children.toArray(children).some(
    (child) => isFilterChip(child) && child.props.selected === true
  )
  let fallbackAssigned = false
  const trackChildren = React.Children.map(children, (child) => {
    if (!isFilterChip(child) || child.props.tabIndex != null) return child
    if (child.props.selected === true) return child
    if (!anySelected && !fallbackAssigned) {
      fallbackAssigned = true
      return React.cloneElement(child, { tabIndex: 0 })
    }
    return child
  })
  const hasChips = React.Children.count(children) > 0

  const onTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof HTMLElement) || target.dataset.slot !== "filter-chip") {
      return
    }

    const chips = Array.from(
      trackRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-slot="filter-chip"]:not(:disabled)'
      ) ?? []
    )
    if (chips.length === 0) return

    const direction =
      trackRef.current == null
        ? "ltr"
        : getComputedStyle(trackRef.current).direction
    const nextKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight"
    const prevKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft"
    const current = chips.indexOf(target as HTMLButtonElement)

    let next = -1
    if (event.key === "Home") next = 0
    else if (event.key === "End") next = chips.length - 1
    else if (event.key === nextKey || event.key === "ArrowDown") {
      next = current < 0 ? 0 : (current + 1) % chips.length
    } else if (event.key === prevKey || event.key === "ArrowUp") {
      next = current <= 0 ? chips.length - 1 : current - 1
    }
    if (next < 0) return

    event.preventDefault()
    const chip = chips[next]
    if (!chip) return
    chip.focus()
    if (chip.getAttribute("aria-checked") !== "true") chip.click()
  }

  return (
    <div
      data-slot="filter-bar"
      className={cn("flex w-full flex-wrap items-center gap-3", className)}
      {...props}
    >
      {hasChips && (
        <FilterBarContext.Provider value={true}>
          <div
            ref={trackRef}
            role="radiogroup"
            aria-label={ariaLabel}
            onKeyDown={onTrackKeyDown}
            className="inline-flex flex-wrap items-center gap-0.5 rounded-full bg-muted p-[3px]"
          >
            {trackChildren}
          </div>
        </FilterBarContext.Provider>
      )}
      {trailing != null && (
        <div className="ms-auto flex items-center gap-2">{trailing}</div>
      )}
    </div>
  )
}

export interface FilterOption {
  value: string
  label: string
  /** Facet count, shown at the end of the row. */
  count?: number
  disabled?: boolean
}

export interface FilterMenuProps {
  /** Trigger label, for example "Status". */
  label: string
  options: FilterOption[]
  /** Selected values. The caller owns this list. */
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  /**
   * `multiple` toggles each option. `single` keeps one value and closes.
   * @default "multiple"
   */
  mode?: "single" | "multiple"
  /**
   * Show a search field. Omit it and the field appears once there are more
   * than eight options.
   */
  searchable?: boolean
  /** Replaces the funnel icon. Pass `null` to omit the icon. */
  icon?: React.ReactNode | null
  disabled?: boolean
  className?: string
  contentClassName?: string
  align?: "start" | "center" | "end"
}

function optionLabel(options: FilterOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

/**
 * Faceted filter menu.
 *
 * The trigger names the facet and, once something is chosen, the current
 * value. The popover is a checklist — or a single choice — with an optional
 * search and a clear action.
 */
function FilterMenu({
  label,
  options,
  selected,
  onSelectedChange,
  mode = "multiple",
  searchable,
  icon,
  disabled = false,
  className,
  contentClassName,
  align = "start",
}: FilterMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const showSearch = searchable ?? options.length > 8
  const normalized = query.trim().toLowerCase()
  const visible = normalized
    ? options.filter((option) => option.label.toLowerCase().includes(normalized))
    : options

  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const summary =
    selected.length === 0
      ? null
      : selected.length === 1
        ? optionLabel(options, selected[0] ?? "")
        : `${selected.length} selected`

  const toggle = (value: string) => {
    if (mode === "single") {
      onSelectedChange(selected.includes(value) ? [] : [value])
      setOpen(false)
      return
    }
    onSelectedChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "border-dashed",
              selected.length > 0 && "border-solid",
              className
            )}
          >
            {icon === undefined ? <FunnelSimpleIcon /> : icon}
            {label}
            {summary != null && (
              <>
                <span aria-hidden="true" className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                <Badge variant="secondary" size="sm">
                  {summary}
                </Badge>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent
        align={align}
        className={cn("w-56 gap-0 p-0", contentClassName)}
      >
        {showSearch && (
          <div className="p-1 pb-0">
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              aria-label={`Search ${label}`}
              className="h-8"
            />
          </div>
        )}
        <div
          role={mode === "single" ? "radiogroup" : "group"}
          aria-label={label}
          className="no-scrollbar max-h-64 overflow-y-auto p-1"
        >
          {visible.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-xs text-muted-foreground">
              No matches.
            </p>
          ) : (
            visible.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  role={mode === "single" ? "radio" : "checkbox"}
                  aria-checked={isSelected}
                  disabled={option.disabled}
                  onClick={() => toggle(option.value)}
                  className={cn(
                    "flex min-h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-start text-xs",
                    "transition-[background-color,scale] duration-fast ease-out",
                    "hover:bg-muted active:scale-[0.96] active:duration-instant motion-reduce:active:scale-100",
                    "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center border border-input text-primary-foreground",
                      mode === "single" ? "rounded-full" : "rounded-[4px]",
                      isSelected && "border-primary bg-primary"
                    )}
                  >
                    {isSelected && <CheckIcon className="size-3" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.count != null && (
                    <span className="shrink-0 text-3xs text-muted-foreground tabular-nums">
                      {option.count}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
        {selected.length > 0 && (
          <div className="border-t border-border p-1">
            <button
              type="button"
              onClick={() => onSelectedChange([])}
              className="flex min-h-7 w-full cursor-pointer items-center justify-center rounded-md px-2.5 text-xs text-muted-foreground transition-[color,background-color,scale] duration-fast ease-out hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] active:duration-instant motion-reduce:active:scale-100"
            >
              Clear
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export interface FilterTokenProps extends React.ComponentProps<"span"> {
  /** Facet name, for example "Status". */
  label: string
  /** Chosen value. Omit when the label is the whole token. */
  value?: React.ReactNode
  /** Removes this token. Omit for a read-only token. */
  onRemove?: () => void
}

/** A chosen filter, with an optional remove button. */
function FilterToken({
  label,
  value,
  onRemove,
  className,
  ...props
}: FilterTokenProps) {
  return (
    <span
      data-slot="filter-token"
      className={cn(
        "inline-flex h-6.5 max-w-full items-center gap-1 rounded-full border border-border bg-background ps-2.5 text-xs",
        onRemove ? "pe-0.5" : "pe-2.5",
        className
      )}
      {...props}
    >
      <span className="truncate text-muted-foreground">{label}</span>
      {value != null && (
        <>
          <span aria-hidden="true" className="text-muted-foreground/50">
            :
          </span>
          <span className="truncate font-medium text-foreground">{value}</span>
        </>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
          className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,scale] duration-fast ease-out hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] active:duration-instant motion-reduce:active:scale-100"
        >
          <XIcon className="size-3" />
        </button>
      )}
    </span>
  )
}

/** Quiet control that clears every active filter. */
function FilterClear({
  className,
  children = "Clear filters",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="quiet"
      data-slot="filter-clear"
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}

export { FilterBar, FilterChip, FilterClear, FilterMenu, FilterToken }
