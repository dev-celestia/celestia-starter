import { config } from "@workspace/eslint-config/base"

/**
 * `features/**` holds manifest-driven templates and insertion snippets —
 * fragments that are intentionally not valid standalone TypeScript, copied or
 * spliced into target repos by the installer. Only the engine itself lints.
 *
 * @type {import("eslint").Linter.Config}
 */
export default [
  ...config,
  {
    ignores: ["features/**"],
  },
]
