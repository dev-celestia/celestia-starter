"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { Button } from "@celestia-project/ui"
import { toast } from "@celestia-project/ui/primitive/sonner"

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API can be rejected (unfocused window, denied permission) —
    // fall back to the legacy path before giving up.
    const area = document.createElement("textarea")
    area.value = text
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    area.remove()
    return ok
  }
}

export function CopyTemplateButton({
  text,
  title,
}: {
  text: string
  title: string
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    const ok = await writeClipboard(text)
    if (ok) {
      setCopied(true)
      toast.success(`Copied ${title} — paste it into your app`)
      window.setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error(
        `Could not copy ${title} — clipboard is blocked in this browser`
      )
    }
  }

  return (
    <Button onClick={handleCopy} title={`Copy the ${title} source file`}>
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy code"}
    </Button>
  )
}
