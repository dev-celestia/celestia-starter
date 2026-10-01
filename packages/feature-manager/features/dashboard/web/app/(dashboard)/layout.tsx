"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Skeleton } from "@celestia-project/ui"

import { useSession } from "@/lib/auth-client"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  // The proxy does a fast optimistic redirect for unauthenticated visitors.
  // This is the authoritative client-side guard: once the auth client resolves
  // with no session, send the user to sign in.
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in?callbackURL=/dashboard")
    }
  }, [isPending, session, router])

  if (isPending || !session) {
    // Mirrors the real sidebar/main split so the shell does not jump when the
    // session resolves. The previous bare "Loading..." string collapsed the
    // layout to one centred line and then reflowed the entire page around it.
    return (
      <div className="flex min-h-svh" aria-busy="true">
        <span role="status" className="sr-only">
          Loading your dashboard
        </span>

        <div className="flex w-14 shrink-0 flex-col border-r bg-muted/30 md:w-56">
          <div className="flex h-14 items-center justify-center border-b px-4 md:justify-start">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="ms-2 hidden h-4 w-20 md:block" />
          </div>
          <div className="flex flex-1 flex-col gap-1 p-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
          <div className="border-t p-3">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        <main className="flex min-w-0 flex-1 flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh">
      <Sidebar user={session.user} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
