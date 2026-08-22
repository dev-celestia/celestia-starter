import * as React from "react"
import { TokensViewer } from "./tokens-viewer"

export function TokensTab() {
  return (
    <div className="pt-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Design Token System</h2>
        <p className="text-sm text-muted-foreground">
          The foundation of Celestia: atomic design variables for colors, typography, border radius, and elevation.
        </p>
      </div>
      <TokensViewer />
    </div>
  )
}
