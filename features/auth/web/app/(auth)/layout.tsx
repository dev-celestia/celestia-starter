export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Celestia</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-muted" />
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
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
