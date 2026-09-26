"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, TerminalIcon } from "@phosphor-icons/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@celestia-project/ui"

import { COMMAND_CHIPS, SAMPLE_COMMANDS } from "./content"

/** How long the button keeps its "Copied" confirmation before resetting. */
const CONFIRM_MS = 1800

/**
 * The hero's command bar.
 *
 * It does one honest thing: put a real command on the clipboard. The cycling
 * placeholder shows the range of the CLI before anyone types, and the chip row
 * offers the same commands in one click.
 */
export function CommandBar() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState("")
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0)
  const [copied, setCopied] = React.useState(false)

  // Cycle the placeholder so the bar demonstrates the commands it takes. It
  // stops once the field has content — the placeholder is invisible then, and
  // re-rendering the input on a timer is pure waste.
  React.useEffect(() => {
    if (value) return

    const timer = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % SAMPLE_COMMANDS.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [value])

  // Clear the confirmation on a timer, and on unmount so a pending timeout
  // cannot set state on a component that is gone.
  React.useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), CONFIRM_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
    } catch {
      // Clipboard access needs a secure context and permission. Rather than
      // claim a copy that did not happen, hand the command back to the user
      // selected so ⌘C finishes the job.
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    void copy(value.trim() || SAMPLE_COMMANDS[placeholderIndex])
  }

  return (
    <>
      <form className="landing-ask" onSubmit={submit}>
        <InputGroup>
          <InputGroupAddon>
            <TerminalIcon />
          </InputGroupAddon>
          <InputGroupInput
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={SAMPLE_COMMANDS[placeholderIndex]}
            aria-label="A Celestia command to copy"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" variant="default" size="sm">
              {copied ? (
                <>
                  Copied
                  <CheckIcon />
                </>
              ) : (
                <>
                  Copy
                  <CopyIcon />
                </>
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>

      <div className="landing-ask-queries">
        <span className="landing-ask-label">Try one:</span>
        {COMMAND_CHIPS.map((chip) => (
          <button
            key={chip.command}
            type="button"
            className="landing-ask-query"
            onClick={() => void copy(chip.command)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </>
  )
}
