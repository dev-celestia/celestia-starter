import { Badge } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

/**
 * The eyebrow / title / description block that opens a landing section.
 *
 * Four sections had copy-pasted this markup with small drifts — two different
 * badge paddings, inconsistent heading margins, one section missing the
 * eyebrow entirely. One component keeps every section header identical, which
 * is what makes the page read as one page rather than four.
 *
 * Defaults to start-aligned: in the rail layout every section heading shares
 * the hero headline's left edge, so the page reads as one column of work.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: Readonly<{
  eyebrow: string
  title: string
  description?: string
  align?: "center" | "start"
  className?: string
}>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center"
          ? "mx-auto max-w-2xl items-center text-center"
          : "max-w-2xl items-start text-start",
        className,
      )}
    >
      <Badge variant="outline" mono className="text-xs uppercase tracking-wider">
        {eyebrow}
      </Badge>
      <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground leading-relaxed text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  )
}
