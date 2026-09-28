"use client"

import * as React from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { Button, Kbd } from "@celestia-project/ui"

import { SearchDialog } from "@/components/docs/search-dialog"

/**
 * Docs search entry point. Previously lived in the shared top navbar;
 * now a trigger row inside the docs layout so ⌘K keeps working after the
 * switch to the site layout's rail.
 */
export function DocsSearchTrigger() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground hover:text-foreground gap-2 font-normal"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="size-3.5" aria-hidden />
        Search docs…
        <Kbd className="ms-3">⌘K</Kbd>
      </Button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
