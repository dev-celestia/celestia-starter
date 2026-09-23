import Link from "next/link"

/**
 * Shared chrome for the auth screens (sign-in / sign-up).
 *
 * Both pages previously inlined near-identical copies of the heading, error
 * line, "or continue with" divider and footer link — four places to drift. The
 * pieces live here so the two screens stay visually identical by construction.
 */

export function AuthHeading({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <div className="flex flex-col gap-1.5 text-center">
      <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

/**
 * Form-level error. `role="alert"` so screen readers announce the failure —
 * the previous bare `<p>` was silent for assistive tech, and the red text alone
 * is not an accessible signal.
 */
export function AuthError({ message }: Readonly<{ message: string | null }>) {
  if (!message) return null

  return (
    <p
      role="alert"
      className="rounded-sm border border-destructive/35 bg-destructive/[0.07] px-2.5 py-1.5 text-xs text-destructive"
    >
      {message}
    </p>
  )
}

export function AuthDivider({
  label = "Or continue with",
}: Readonly<{ label?: string }>) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-2 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      </div>
    </div>
  )
}

export function AuthFooterLink({
  prompt,
  linkLabel,
  href,
}: Readonly<{ prompt: string; linkLabel: string; href: string }>) {
  return (
    <p className="text-center text-xs text-muted-foreground">
      {prompt}{" "}
      <Link
        href={href}
        className="rounded-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {linkLabel}
      </Link>
    </p>
  )
}
