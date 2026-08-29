import Link from "next/link"

export function FloatingFreelancerWidget() {
  return (
    <aside
      aria-label="Custom App Development"
      className="fixed z-50 flex items-center font-sans bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] end-[calc(1rem+env(safe-area-inset-right,0px))] sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:end-[calc(1.25rem+env(safe-area-inset-right,0px))]"
    >
      <Link
        href="/services"
        className="group flex min-h-[38px] items-center gap-2 rounded-xl border border-stroke bg-bg/90 px-3.5 py-2 text-xs shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[#89aacc]/50 hover:bg-surface active:scale-[0.97]"
      >
        <div className="flex items-center gap-2 text-start">
          <span className="font-medium text-text-primary group-hover:text-white transition-colors">
            Need custom app development?
          </span>
          <span className="hidden sm:inline-block text-fog">·</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-fog">
            <span className="size-1.5 rounded-full bg-[#89aacc] animate-pulse" />
            Let&apos;s talk
          </span>
        </div>
      </Link>
    </aside>
  )
}
