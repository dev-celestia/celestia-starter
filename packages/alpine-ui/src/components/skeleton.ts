import { cn } from "../lib/utils"

export function getSkeletonClass(className?: string): string {
  return cn("animate-pulse rounded-md bg-muted", className)
}
