"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui"

import { api } from "@/lib/api-client"

type Post = {
  id: string
  title: string
  published: boolean
  createdAt: string | Date
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await api.api.posts.$get()
    const data = await res.json()
    if (Array.isArray(data)) {
      setPosts(
        data.map((p) => ({
          id: p.id,
          title: p.title,
          published: p.published,
          createdAt: p.createdAt,
        }))
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Intentional fetch-on-mount: the posts list is client-owned state loaded
    // once through the typed RPC client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const handleDelete = async (id: string) => {
    await api.api.posts[":id"].$delete({ param: { id } })
    await load()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your blog posts.
          </p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="h-8 text-xs">New post</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All posts</CardTitle>
          <CardDescription>Your blog posts, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No posts yet. Create your first post.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {post.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.published ? "Published" : "Draft"} ·{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="outline" className="h-7 text-xs">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
