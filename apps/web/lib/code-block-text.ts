import type { ReactNode } from "react"

// Pure text/tree helpers shared by client code blocks and the server-side
// docs renderer — must stay free of "use client" and server-only imports.

export function extractText(node: ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (typeof node === "object" && node !== null && "props" in node) {
    const props = node.props as { children?: ReactNode }
    return props.children ? extractText(props.children) : ""
  }
  return ""
}

export function looksLikeFileTree(rawCode: string): boolean {
  return (
    rawCode.includes("├──") ||
    rawCode.includes("└──") ||
    /^[a-zA-Z0-9_.\-/]+\/\s*\n\s*[├└│]/.test(rawCode)
  )
}
