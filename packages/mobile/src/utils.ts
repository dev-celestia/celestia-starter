import { Children, isValidElement, type ReactNode } from "react"

/**
 * Returns `true` when every node in `children` is a string, number, boolean,
 * null or undefined — i.e. content that **must** be wrapped in a `<Text>`
 * component on React Native.
 *
 * Returns `false` when any child is a React element (a JSX node), because that
 * element already provides its own `<Text>` wrapper or is a `<View>` that
 * cannot be nested inside `<Text>`.
 *
 * This replaces the previous `typeof children === "string"` check, which fails
 * when JSX produces an **array** of children — e.g. `+{count}%` compiles to
 * `["+", count, "%"]`, which is an object, not a string.
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
