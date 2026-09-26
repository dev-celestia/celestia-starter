"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { PostForm } from "@/components/blog/post-form"

import { api } from "@/lib/api-client"

type Post = {
  id: string
  title: string
  content: string
  published: boolean
}

export default function EditPostPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await api.api.posts[":id"].$get({ param: { id } })
      const data = await res.json()
      // The response is a union of { error } and the post; narrow on a field
      // only the post has.
      if ("title" in data) {
        setPost({
          id: data.id,
          title: data.title,
          content: data.content,
          published: data.published,
        })
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }
    // Intentional fetch-on-mount: load the post being edited.
    load()
  }, [id])

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  }

  if (notFound || !post) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Post not found.</div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit post</h1>
        <p className="text-sm text-muted-foreground">Update this blog post.</p>
      </div>
      <PostForm post={post} description="Make changes and save." />
    </div>
  )
}
