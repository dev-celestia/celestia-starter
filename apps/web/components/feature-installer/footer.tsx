import { LogoMark } from "@/components/shared/logo-mark"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-sm font-medium text-foreground">Celestia</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          Next.js 16 · Hono · Better Auth · Drizzle ORM · MIT
        </p>
      </div>
    </footer>
  )
}
