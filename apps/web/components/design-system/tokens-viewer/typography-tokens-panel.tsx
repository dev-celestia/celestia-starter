"use client"

import * as React from "react"
import { Badge, Card } from "@celestia-project/ui"
import { TYPOGRAPHY_SCALE } from "./constants"

export function TypographyTokensPanel() {
  return (
    <div className="space-y-6 pt-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Typographic Hierarchy</h3>
        <p className="text-sm text-muted-foreground">
          Powered by <strong>Geist Sans</strong> and <strong>Geist Mono</strong>. Engineered with precise optical tracking and line height ratios.
        </p>
      </div>

      <Card className="divide-y divide-border/60 overflow-hidden">
        {TYPOGRAPHY_SCALE.map((t, idx) => (
          <div key={idx} className="p-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:w-1/3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm">{t.label}</span>
                <Badge variant="secondary" className="font-mono text-[10px]">{t.size}</Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{t.specs}</p>
              <span className="font-mono text-[11px] text-primary/80 mt-1 block truncate">class=&quot;{t.token}&quot;</span>
            </div>

            <div className="w-full lg:w-2/3 border-t border-border/40 pt-3 lg:border-t-0 lg:pt-0">
              <div className={t.token}>{t.sample}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
