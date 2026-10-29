import {
  Cube,
  Database,
  DesktopTower,
  Fingerprint,
  GitBranch,
  Key,
  Lightning,
  Lock,
  PlugsConnected,
  Scales,
  Scroll,
  ShieldCheck,
  Sparkle,
  Stack,
  Terminal,
} from "@phosphor-icons/react/dist/ssr"

import type { Icon } from "@phosphor-icons/react"

/**
 * Content files reference icons by name so copy stays declarative. This is the
 * single place that maps a name to a component, which also keeps the icon set
 * tree-shakeable.
 *
 * Imported from the `dist/ssr` entry because every consumer of `getIcon` is a
 * server component — the same split `components/agency` uses. Client components
 * import their icons directly from the package root instead.
 */
export const ICONS: Record<string, Icon> = {
  Cube,
  Database,
  DesktopTower,
  Fingerprint,
  GitBranch,
  Key,
  Lightning,
  Lock,
  PlugsConnected,
  Scales,
  Scroll,
  ShieldCheck,
  Stack,
  Terminal,
}

export function getIcon(name: string): Icon {
  return ICONS[name] ?? Sparkle
}
