"use client"

import * as React from "react"
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { RADIUS_TOKENS } from "./constants"

export function RadiusTokensPanel() {
  return (
    <div className="space-y-6 pt-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Corner Radii & Shape System</h3>
        <p className="text-sm text-muted-foreground">
          Standardized border radius scaling computed from a single root variable <code className="text-primary font-mono">--radius: 0.625rem</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RADIUS_TOKENS.map((r) => (
          <Card key={r.name} className="flex flex-col items-center justify-between p-5 text-center">
            <CardHeader className="flex flex-row w-full items-center justify-between p-0">
              <CardTitle className="text-sm font-semibold">{r.name}</CardTitle>
              <Badge variant="outline" className="font-mono text-xs">{r.token}</Badge>
            </CardHeader>

            <CardContent className="w-full p-0">
              {/* Visual Representation Box */}
              <div
                className={cn(
                  "my-6 mx-auto flex h-24 w-24 items-center justify-center border-2 border-primary bg-primary/10 shadow-xs transition-all",
                  r.token
                )}
              >
                <span className="font-mono text-[11px] font-medium text-primary">{r.rem}</span>
              </div>

              <div className="w-full border-t border-border/50 pt-3 text-start">
                <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                  <span>Formula:</span>
                  <span>{r.px}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong className="text-foreground">Usage:</strong> {r.usage}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
