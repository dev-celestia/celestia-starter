import { Children, isValidElement, type ReactNode } from "react"

/**
 * Returns `true` when `children` is content that **must** be wrapped in a
 * `<Text>` component on React Native: a string, a number, or an array whose
 * every entry is a string or a number.
 *
 * Returns `false` for everything else — `null`, `undefined` and booleans (all
 * of which render nothing), and any React element, because an element either
 * supplies its own `<Text>` wrapper or is a `<View>` that cannot be nested
 * inside `<Text>`.
 *
 * This exists because JSX produces an **array** whenever an element has more
 * than one child: `+{count}%` compiles to `["+", count, "%"]`. Neither check it
 * replaces can tell the two shapes apart:
 *
 * - `typeof children === "string"` is `false` for that array, so the strings
 *   were rendered as direct children of a `<View>` — which React Native rejects
 *   ("Text strings must be rendered within a `<Text>` component").
 * - `React.isValidElement(children)` is also `false` for that array, so the
 *   array was nested inside `<Text>` instead — which crashes as soon as it
 *   contains a `<View>`, e.g. an icon passed as one of several children.
 *
 * Caveat: a *mixed* array — text alongside an element, as in `<Icon/> Sign in`
 * — returns `false`, so the caller renders it as-is. Wrap each text run in
 * `<MobileText>` explicitly in that case.
 */
export function isTextChildren(children: ReactNode): boolean {
  if (children == null || typeof children === "boolean") return false
  if (typeof children === "string" || typeof children === "number") return true
  if (Array.isArray(children)) {
    return Children.toArray(children).every(
      (child) => typeof child === "string" || typeof child === "number"
    )
  }
  // Any React element means the caller already composed its own content.
  return !isValidElement(children)
}
