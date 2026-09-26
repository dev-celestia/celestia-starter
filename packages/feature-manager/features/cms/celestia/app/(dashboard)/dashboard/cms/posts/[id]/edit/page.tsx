"use client";

import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { PostEditor } from "@/components/cms/post-editor";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  return (
    <PostEditor postId={id} role={session?.user.role} currentUserId={session?.user.id ?? ""} />
  );
}
