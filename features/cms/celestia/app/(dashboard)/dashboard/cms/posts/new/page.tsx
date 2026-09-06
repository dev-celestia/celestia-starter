"use client";

import { useSession } from "@/lib/auth-client";
import { PostEditor } from "@/components/cms/post-editor";

export default function NewPostPage() {
  const { data: session } = useSession();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New post</h1>
        <p className="text-sm text-muted-foreground">
          The draft is created automatically on first save.
        </p>
      </div>
      <PostEditor postId={null} role={session?.user.role} currentUserId={session?.user.id ?? ""} />
    </div>
  );
}
