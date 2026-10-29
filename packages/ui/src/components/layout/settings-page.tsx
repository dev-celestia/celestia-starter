import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"

export interface SettingsSection {
  /** Stable key. Also used for the panel's `id` / `aria-controls` wiring. */
  id: string
  label: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  content: React.ReactNode
  /** Renders the entry in the destructive tone — delete, transfer, revoke. */
  danger?: boolean
}

export interface SettingsPageProps extends Omit<React.ComponentProps<"div">, "title" | "children"> {
  /**
   * Re-declared after `Omit`-ing the DOM attribute: `title` is a real `<div>`
   * attribute typed `string`, and narrowing it to `ReactNode` without the
   * `Omit` is a hard TS2430 on the interface itself.
   */
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  sections: SettingsSection[]
  /** Active section, when controlled. */
  value?: string
  /** Active section, when uncontrolled. Falls back to the first section. */
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Width of the section navigation column from `lg` up. */
  navWidth?: "sm" | "md"
  /** Accessible name of the section navigation. */
  navLabel?: string
  /** Max width of the whole page. */
  width?: "lg" | "xl" | "full"
}

const navWidthMap = {
  sm: "lg:w-44",
  md: "lg:w-56",
} as const

const widthMap = {
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-none",
} as const

/**
 * A settings page: a section navigation column beside stacked panels.
 *
 * Every panel is rendered and the inactive ones are hidden, rather than the
 * active panel being swapped in. That keeps uncontrolled inputs — half-typed
 * passwords, unsaved toggles — alive while the user moves between sections,
 * which is exactly what a settings page is for.
 */
function SettingsPage({
  title,
  description,
  actions,
  sections,
  value,
  defaultValue,
  onValueChange,
  navWidth = "md",
  navLabel = "Settings sections",
  width = "lg",
  className,
  ...props
}: SettingsPageProps) {
  const [uncontrolled, setUncontrolled] = React.useState(
    () => defaultValue ?? sections[0]?.id ?? ""
  )
  const isControlled = value !== undefined
  const requested = isControlled ? value : uncontrolled
  // Sections often arrive after a fetch, so fall back to the first one whenever
  // the requested id is not (or no longer) present.
  const activeId = sections.some((section) => section.id === requested)
    ? requested
    : sections[0]?.id ?? ""

  const select = (id: string) => {
    if (!isControlled) setUncontrolled(id)
    onValueChange?.(id)
  }

  return (
    <div
      data-slot="settings-page"
      className={cn(
        "bg-background flex min-h-0 flex-1 flex-col gap-5 p-4 md:p-6 lg:p-8",
        className
      )}
      {...props}
    >
      {(title != null || description != null || actions != null) && (
        <div
          data-slot="settings-page-header"
          className={cn(
            "mx-auto flex w-full flex-col gap-1",
            widthMap[width]
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              {title != null && (
                <h1 className="font-heading text-foreground text-lg font-semibold tracking-tight">
                  {title}
                </h1>
              )}
              {description != null && (
                <p className="text-muted-foreground text-sm">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "mx-auto flex w-full min-h-0 flex-1 flex-col gap-5 lg:flex-row lg:gap-8",
          widthMap[width]
        )}
      >
        <div
          data-slot="settings-page-nav"
          role="tablist"
          aria-orientation="vertical"
          aria-label={navLabel}
          className={cn(
            "flex shrink-0 flex-col gap-0.5",
            navWidthMap[navWidth]
          )}
        >
          {sections.map((section) => {
            const isActive = section.id === activeId
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`settings-tab-${section.id}`}
                aria-selected={isActive}
                aria-controls={`settings-panel-${section.id}`}
                onClick={() => select(section.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isActive
                    ? "text-accent-foreground bg-accent"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  section.danger &&
                    (isActive
                      ? "bg-destructive/10 text-destructive"
                      : "text-destructive/80 hover:bg-destructive/10 hover:text-destructive")
                )}
              >
                {section.icon && (
                  <span className="shrink-0 [&_svg]:size-3.5">
                    {section.icon}
                  </span>
                )}
                <span className="min-w-0 truncate">{section.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {sections.map((section) => {
            const isActive = section.id === activeId
            return (
              <section
                key={section.id}
                id={`settings-panel-${section.id}`}
                role="tabpanel"
                aria-labelledby={`settings-tab-${section.id}`}
                data-slot="settings-page-panel"
                data-state={isActive ? "active" : "inactive"}
                // The Tailwind `hidden` utility, not the HTML attribute: a
                // `display: flex` class on the same element would win against
                // the UA's `[hidden]` rule and leave every panel visible.
                className={cn("flex flex-col gap-4", !isActive && "hidden")}
              >
                {(section.label != null || section.description != null) && (
                  <div className="flex flex-col gap-1">
                    <h2 className="font-heading text-foreground text-sm font-medium">
                      {section.label}
                    </h2>
                    {section.description != null && (
                      <p className="text-muted-foreground text-xs/relaxed">
                        {section.description}
                      </p>
                    )}
                  </div>
                )}
                {section.content}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { SettingsPage }
