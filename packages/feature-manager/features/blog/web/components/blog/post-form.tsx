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
  Textarea,
} from "@celestia-project/ui"

import { api } from "@/lib/api-client"

type PostValues = {
  id: string
  title: string
  content: string
  published: boolean
}

export function PostForm({
  post,
  description,
}: {
  post?: Partial<PostValues>
  description: string
}) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [published, setPublished] = useState(post?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const res = post?.id
      ? await api.api.posts[":id"].$patch({
          param: { id: post.id },
          json: { title, content, published },
        })
      : await api.api.posts.$post({ json: { title, content, published } })

    if (!res.ok) {
      setError("Failed to save the post. Please try again.")
      setSaving(false)
      return
    }

    router.push("/dashboard/posts")
    router.refresh()
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{post?.id ? "Edit post" : "New post"}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post..."
            />
          </div>

          <label className="flex w-fit items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="size-3.5 accent-primary"
            />
            Published
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="h-8 text-xs">
              {saving ? "Saving..." : post?.id ? "Save changes" : "Create post"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
