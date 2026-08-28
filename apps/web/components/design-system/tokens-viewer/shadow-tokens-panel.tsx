"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@celestia-project/ui"
import { SHADOW_TOKENS } from "./constants"

export function ShadowTokensPanel() {
  return (
    <div className="space-y-6 pt-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Elevation & Depth Layers</h3>
        <p className="text-sm text-muted-foreground">
          Layered depth tokens for structural separation without relying on heavy borders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SHADOW_TOKENS.map((s) => (
          <Card key={s.name} className={`flex flex-col justify-between p-6 ${s.token} transition-all`}>
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-sm font-semibold">{s.name}</CardTitle>
                <span className="font-mono text-xs text-primary">{s.token}</span>
              </div>
              <CardDescription className="text-xs">{s.desc}</CardDescription>
            </CardHeader>

            <CardContent className="p-0 mt-4">
              <div className="flex items-center justify-center rounded-lg border border-border/40 bg-muted/40 py-4">
                <span className="text-xs font-medium text-muted-foreground">Interactive Surface Element</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
