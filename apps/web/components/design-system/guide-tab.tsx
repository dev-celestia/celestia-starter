import * as React from "react"
import { ExternalGuide } from "./external-guide"

export function GuideTab() {
  return (
    <div className="pt-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Using in External Projects</h2>
        <p className="text-sm text-muted-foreground">
          How to consume <code className="font-mono text-primary font-medium">@celestia-project/ui</code> and design tokens in external Next.js, Vite, Remix, or React repositories.
        </p>
      </div>
      <ExternalGuide />
    </div>
  )
}
