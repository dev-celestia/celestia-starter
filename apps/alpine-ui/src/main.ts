import "./style.css"
import Alpine from "alpinejs"
import collapse from "@alpinejs/collapse"
import { alpineUI } from "@celestia-project/alpine-ui"
import { components, groups, pillars } from "./data"
import { createThemeStore } from "./theme"

Alpine.plugin(collapse)
Alpine.plugin(alpineUI)

Alpine.data("themeCustomizer", createThemeStore)

Alpine.data("app", () => ({
  groups,
  components,
  pillars,
  activeSection: "overview",

  init() {
    const watchable = this as unknown as {
      $watch: (k: string, fn: (v: string) => void) => void
    }
    watchable.$watch("activeSection", (id: string) => {
      if (id !== "overview") {
        history.replaceState(null, "", `#${id}`)
      }
    })
  },
}))

window.Alpine = Alpine
Alpine.start()
