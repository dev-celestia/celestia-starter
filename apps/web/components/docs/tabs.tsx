"use client"

import * as React from "react"
import { cn } from "@celestia-project/ui/lib/utils"

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: string[]
  defaultValue?: string
}

export function Tabs({ items, defaultValue, children, className, ...props }: TabsProps) {
  // If items array is provided, default to first item
  const initialTab: string = defaultValue || (items && items.length > 0 && items[0] ? items[0] : "")
  const [activeTab, setActiveTab] = React.useState<string>(initialTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("my-6 flex flex-col rounded-xl border border-border/70 bg-card/40 overflow-hidden shadow-xs", className)} {...props}>
        {items && items.length > 0 && (
          <div className="flex items-center gap-1 border-b border-border/60 bg-muted/40 p-1.5 overflow-x-auto scrollbar-none">
            {items.map((item) => {
              const isActive = activeTab === item
              return (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer active:scale-97",
                    isActive
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item}
                </button>
              )
            })}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </TabsContext.Provider>
  )
}

export interface TabProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function Tab({ value, children, className, ...props }: TabProps) {
  const context = React.useContext(TabsContext)
  if (!context) return <div className={className}>{children}</div>

  if (context.activeTab !== value) return null

  return (
    <div className={cn("animate-in fade-in-50 duration-150", className)} {...props}>
      {children}
    </div>
  )
}
