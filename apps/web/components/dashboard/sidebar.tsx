"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GearSixIcon, HouseIcon } from "@phosphor-icons/react"
// feature-manager:imports:begin
// feature-manager:imports:blog:begin
import { NoteBlankIcon } from "@phosphor-icons/react"
// feature-manager:imports:blog:end
// feature-manager:imports:access:begin
import { UsersThreeIcon } from "@phosphor-icons/react"
// feature-manager:imports:access:end
// feature-manager:imports:end

import { cn } from "@celestia-project/ui/lib/utils"
import type { Session } from "@/lib/auth-client"
import { LogoMark } from "@/components/shared/logo-mark"
import { UserNav } from "@/components/dashboard/user-nav"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: HouseIcon },
  // feature-manager:nav:begin
  // feature-manager:nav:blog:begin
  { label: "Posts", href: "/dashboard/posts", icon: NoteBlankIcon },
  // feature-manager:nav:blog:end
  // feature-manager:nav:access:begin
  { label: "Users", href: "/dashboard/users", icon: UsersThreeIcon, adminOnly: true },
  // feature-manager:nav:access:end
  // feature-manager:nav:end
  { label: "Settings", href: "/dashboard/settings", icon: GearSixIcon },
]

export function Sidebar({ user }: { user: Session["user"] }) {
  const pathname = usePathname()

  // Collapses to a 56px icon rail below `md` — the fixed `w-56` rail consumed
  // 224px of a 375px viewport, leaving the content column unusable. Labels are
  // hidden rather than removed so the accessible name is preserved by
  // `aria-label` on each link.
  return (
    <aside className="flex w-14 shrink-0 flex-col border-r bg-muted/30 md:w-56">
      <div className="flex h-14 items-center justify-center border-b px-4 md:justify-start">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark />
          <span className="hidden md:inline">Celestia</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          // feature-manager:nav-visibility:begin
          // feature-manager:nav-visibility:access:begin
          if ("adminOnly" in item && item.adminOnly && user.role !== "admin") return null
          // feature-manager:nav-visibility:access:end
          // feature-manager:nav-visibility:end
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:justify-start",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3">
        <UserNav user={user} />
      </div>
    </aside>
  )
}
