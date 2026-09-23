import type { Icon } from "@phosphor-icons/react"

import { cn } from "@celestia-project/ui/lib/utils"

/**
 * The square icon chip that heads a service, a process step and an engagement
 * model. Three sections hand-rolled the same `border-primary/20 bg-primary/10
 * text-primary` div with slightly different sizes and radii; this is that one
 * decision in one place.
 */
export function IconTile({
  icon: Icon,
  size = "md",
  className,
}: Readonly<{
  icon: Icon
  size?: "md" | "lg"
  className?: string
}>) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-primary/20 bg-primary/10 text-primary",
        size === "lg" ? "size-11 rounded-xl" : "size-10 rounded-lg",
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-6" : "size-5"} weight="duotone" />
    </div>
  )
}
