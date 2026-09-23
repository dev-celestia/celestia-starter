const ESC = "\u001b["

const CODES = {
  reset: 0,
  bold: 1,
  dim: 2,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  cyan: 36,
  gray: 90,
} as const

function defaultColor(): boolean {
  if (process.env.NO_COLOR) return false
  if (process.env.FORCE_COLOR) return true
  return Boolean(process.stdout.isTTY)
}

export interface UiOptions {
  /** Suppress routine output; warnings/errors and the final result still show. */
  quiet?: boolean
  /** Suppress all human output (the caller prints a JSON document instead). */
  json?: boolean
  color?: boolean
}

/** Small console abstraction so output honours --quiet/--json/NO_COLOR. */
export class Ui {
  readonly quiet: boolean
  readonly json: boolean
  private readonly color: boolean

  constructor(options: UiOptions = {}) {
    this.quiet = options.quiet ?? false
    this.json = options.json ?? false
    this.color = options.color ?? defaultColor()
  }

  paint(code: keyof typeof CODES, text: string): string {
    return this.color ? `${ESC}${CODES[code]}m${text}${ESC}0m` : text
  }

  out(message = ""): void {
    if (!this.quiet && !this.json) console.log(message)
  }

  detail(message: string): void {
    this.out(`    ${this.paint("gray", message)}`)
  }

  heading(message: string): void {
    this.out(`\n${this.paint("bold", message)}`)
  }

  success(message: string): void {
    this.out(`${this.paint("green", "✓")} ${message}`)
  }

  step(message: string): void {
    this.out(`  ${message}`)
  }

  warn(message: string): void {
    if (this.json) return
    console.error(`${this.paint("yellow", "⚠")} ${message}`)
  }

  error(message: string): void {
    if (this.json) return
    console.error(`${this.paint("red", "✗")} ${message}`)
  }

  /** Always printed (unless --json) — used for the final result line. */
  result(message: string): void {
    if (this.json) return
    console.log(message)
  }

  emitJson(data: unknown): void {
    console.log(JSON.stringify(data, null, 2))
  }
}
