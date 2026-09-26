"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@celestia-project/ui"

import { authClient } from "@/lib/auth-client"
import type { Session } from "@/lib/auth-client"

export function ProfileForm({ user }: { user: Session["user"] }) {
  const router = useRouter()
  const [name, setName] = useState(user.name ?? "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    const { error } = await authClient.updateUser({ name })

    if (error) {
      setError(error.message ?? "Failed to update profile")
    } else {
      setMessage("Profile updated successfully")
      router.refresh()
    }

    setSaving(false)
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your display name.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-xs text-muted-foreground">
              Your email address can&apos;t be changed here.
            </p>
          </div>

          {message && <p className="text-xs text-green-600">{message}</p>}
          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" disabled={saving} className="h-8 w-fit text-xs">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
