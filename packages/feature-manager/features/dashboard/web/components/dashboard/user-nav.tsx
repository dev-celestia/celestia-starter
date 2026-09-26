"use client"

import { useRouter } from "next/navigation"
import { SignOut, UserCircle } from "@phosphor-icons/react"
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuSeparator,
  MenuTrigger,
} from "@celestia-project/ui"

import { signOut } from "@/lib/auth-client"
import type { Session } from "@/lib/auth-client"

export function UserNav({ user }: { user: Session["user"] }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in")
        },
      },
    })
  }

  return (
    <Menu>
      <MenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs outline-none transition-colors hover:bg-background">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[0.625rem] font-semibold text-primary-foreground">
          {user.name?.charAt(0).toUpperCase() ?? "?"}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-muted-foreground">{user.email}</span>
        </span>
      </MenuTrigger>
      <MenuPortal>
        <MenuPositioner sideOffset={8} align="start">
          <MenuPopup className="w-56">
            <MenuGroup>
              <MenuGroupLabel>{user.email}</MenuGroupLabel>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem onClick={() => router.push("/dashboard/settings")}>
              <UserCircle />
              Profile settings
            </MenuItem>
            <MenuSeparator />
            <MenuItem variant="destructive" onClick={handleSignOut}>
              <SignOut />
              Sign out
            </MenuItem>
          </MenuPopup>
        </MenuPositioner>
      </MenuPortal>
    </Menu>
  )
}
