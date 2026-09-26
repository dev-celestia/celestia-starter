"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GearSix, House } from "@phosphor-icons/react"
// feature-manager:imports:begin
// feature-manager:imports:end

import { cn } from "@celestia-project/ui/lib/utils"
import type { Session } from "@/lib/auth-client"
import { UserNav } from "@/components/dashboard/user-nav"


const navItems = [
  { label: "Overview", href: "/dashboard", icon: House },
  // feature-manager:nav:begin
  // feature-manager:nav:end
  { label: "Settings", href: "/dashboard/settings", icon: GearSix },
]

export function Sidebar({ user }: { user: Session["user"] }) {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span>Celestia</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          // feature-manager:nav-visibility:begin
          // feature-manager:nav-visibility:end
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
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
