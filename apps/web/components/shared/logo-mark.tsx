import Image from "next/image"

import { cn } from "@celestia-project/ui/lib/utils"

/**
 * The Celestia mark. Shared brand primitive — used by the landing nav, the
 * landing footer, the docs/app header and the auth layout, so it lives in
 * `components/shared` rather than inside the landing nav-bar.
 */
export function LogoMark({ className }: Readonly<{ className?: string }>) {
  return (
    <Image
      src="/celestia-icon.png"
      alt="Celestia"
      width={28}
      height={28}
      className={cn("size-7 shrink-0 rounded-md object-contain", className)}
      priority
    />
  )
}
