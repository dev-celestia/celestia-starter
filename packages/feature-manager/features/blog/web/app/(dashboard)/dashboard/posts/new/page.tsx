import { PostForm } from "@/components/blog/post-form"

export default function NewPostPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New post</h1>
        <p className="text-sm text-muted-foreground">Write a new blog post.</p>
      </div>
      <PostForm description="Draft a post and publish it when you're ready." />
    </div>
  )
}
