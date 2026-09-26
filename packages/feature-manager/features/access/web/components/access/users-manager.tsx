"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui"

import { api } from "@/lib/api-client"

type AdminUser = {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean
  banReason: string | null
  createdAt: string | Date
}

type PendingAction =
  | { type: "ban"; user: AdminUser }
  | { type: "delete"; user: AdminUser }

const PAGE_SIZE = 10

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [activeSearch, setActiveSearch] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingAction | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await api.api.admin.users.$get({
      query: {
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(activeSearch ? { search: activeSearch } : {}),
      },
    })
    if (res.ok) {
      const data = await res.json()
      setUsers(
        data.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role ?? null,
          banned: Boolean(u.banned),
          banReason: u.banReason ?? null,
          createdAt: u.createdAt,
        }))
      )
      setTotal(data.total)
    }
    setLoading(false)
  }, [page, activeSearch])

  useEffect(() => {
    // Intentional fetch-on-mount / refetch-on-change: the users list is
    // client-owned state loaded through the typed RPC client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setPage(1)
    setActiveSearch(search.trim() || undefined)
  }

  const handleRoleChange = async (id: string, role: string) => {
    await api.api.admin.users[":id"].role.$patch({
      param: { id },
      json: { role: role as "user" | "admin" },
    })
    await load()
  }

  const handleBan = async (id: string) => {
    await api.api.admin.users[":id"].ban.$post({ param: { id }, json: {} })
    await load()
  }

  const handleUnban = async (id: string) => {
    await api.api.admin.users[":id"].unban.$post({ param: { id } })
    await load()
  }

  const handleDelete = async (id: string) => {
    await api.api.admin.users[":id"].$delete({ param: { id } })
    await load()
  }

  const confirmPending = async () => {
    if (!pending) return
    if (pending.type === "ban") {
      await handleBan(pending.user.id)
    } else {
      await handleDelete(pending.user.id)
    }
    setPending(null)
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage accounts, roles, and access. Admin-only.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="h-8 w-56 text-xs"
          />
          <Button type="submit" variant="outline" className="h-8 text-xs">
            Search
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>
            {total} account{total === 1 ? "" : "s"} · newest first
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-muted-foreground">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = u.id === currentUserId
                  const isAdmin = u.role === "admin"
                  // ABAC policies deny acting on yourself or other admins —
                  // mirror that in the UI.
                  const isProtected = isSelf || isAdmin
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {u.name}
                            {isSelf ? " (you)" : ""}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {u.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role ?? "user"}
                          disabled={isProtected}
                          onValueChange={(value) =>
                            handleRoleChange(u.id, String(value))
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {u.banned ? (
                          <Badge
                            variant="destructive"
                            title={u.banReason ?? undefined}
                          >
                            Banned
                          </Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {u.banned ? (
                            <Button
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => handleUnban(u.id)}
                            >
                              Unban
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="h-7 text-xs"
                              disabled={isProtected}
                              onClick={() => setPending({ type: "ban", user: u })}
                            >
                              Ban
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            className="h-7 text-xs"
                            disabled={isProtected}
                            onClick={() =>
                              setPending({ type: "delete", user: u })
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                className="h-7 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                className="h-7 text-xs"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.type === "ban" ? "Ban user" : "Delete user"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.type === "ban"
                ? `${pending.user.name} (${pending.user.email}) will be signed out and blocked from signing in until unbanned.`
                : `${pending?.user.name} (${pending?.user.email}) and all of their data will be permanently removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmPending}
            >
              {pending?.type === "ban" ? "Ban" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
