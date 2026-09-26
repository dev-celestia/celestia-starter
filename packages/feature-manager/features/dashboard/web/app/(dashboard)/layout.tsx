"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

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
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading...
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
