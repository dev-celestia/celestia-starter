import { LogoMark } from "@/components/shared/logo-mark"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="/"
            className="flex items-center gap-2 rounded-sm font-semibold transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <LogoMark />
            <span className="font-heading text-lg tracking-tight">Celestia</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>

      {/*
        Accent panel. `--primary` is achromatic in this palette, so the previous
        `from-primary/20` rendered as a flat grey wash rather than brand blue —
        `--brand` is the only chromatic token in the system, and it is what the
        landing page already uses for the same purpose.
      */}
      <div className="relative hidden overflow-hidden border-l border-border bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-brand/10 to-transparent" />
        <div
          aria-hidden="true"
          className="absolute -top-1/3 -right-1/4 size-[34rem] rounded-full bg-brand/20 blur-3xl"
        />
        <div className="relative flex h-full items-center justify-center p-10">
          <div className="max-w-md text-center">
            <LogoMark className="mx-auto size-12 rounded-xl" />
            <h2 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
              Welcome to Celestia
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Build, ship, and scale your next big idea.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
