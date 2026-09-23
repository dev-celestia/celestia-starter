import Link from "next/link"

export function FloatingFreelancerWidget() {
  return (
    <aside
      aria-label="Custom App Development"
      className="fixed z-50 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] end-[calc(1rem+env(safe-area-inset-right,0px))] sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:end-[calc(1.25rem+env(safe-area-inset-right,0px))]"
    >
      <Link
        href="/services"
        className="group flex min-h-[38px] items-center gap-2 rounded-xl border border-border bg-card/90 px-3.5 py-2 text-xs shadow-xl backdrop-blur-md transition-all duration-slow hover:border-primary/50 hover:bg-accent active:scale-[0.97]"
      >
        <span className="font-medium text-foreground transition-colors duration-slow group-hover:text-primary">
          Need custom app development?
        </span>
        <span className="hidden text-muted-foreground sm:inline-block">·</span>
        <span className="hidden items-center gap-1.5 text-muted-foreground sm:inline-flex">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Let&apos;s talk
        </span>
      </Link>
    </aside>
  )
}
