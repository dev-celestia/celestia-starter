import * as React from "react"
import { StyleSheet, View } from "react-native"
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web"
import { MobileHost } from "@celestia-project/mobile/host"
import { MobileAlert } from "@celestia-project/mobile/composite/alert"
import { MobileSpinner } from "@celestia-project/mobile/primitive/spinner"
import canvaskitWasm from "canvaskit-wasm/bin/full/canvaskit.wasm"

/**
 * Root — **web** variant.
 *
 * In the browser there is no native Skia module. `@shopify/react-native-skia`
 * runs on CanvasKit, a WebAssembly build of Skia that has to be fetched and
 * instantiated before anything drawn with Skia can render — sparklines, the
 * four chart composites and `MobileProgressRing`.
 *
 * The awkward part is *when*. `Skia` is not a lazy getter, it is a module-level
 * constant:
 *
 * ```js
 * // @shopify/react-native-skia/lib/module/skia/Skia.web.js
 * export const Skia = JsiSkApi(global.CanvasKit)
 * ```
 *
 * So whatever `global.CanvasKit` is at the moment that module is first
 * evaluated is what `Skia` stays forever. Importing the app before CanvasKit is
 * ready therefore does not produce a slow first chart — it produces
 * `Cannot read properties of undefined (reading 'PathBuilder')` the first time
 * any Skia component mounts, which unmounts the whole tree and leaves a blank
 * page. Waiting at render time cannot fix that, because by then the module has
 * already been evaluated. The import itself has to be deferred, which is why
 * `./App` below is a dynamic `import()` and why this file exists at all.
 *
 * Everything this file imports statically is Skia-free — the library is reached
 * through its deep entry points (`/host`, `/composite/alert`,
 * `/primitive/spinner`) rather than the root barrel, because the barrel also
 * re-exports the chart components. That is what keeps Skia in the async chunk
 * instead of the initial one, and what lets the loading screen below render
 * with the real theme while CanvasKit is still downloading.
 */
export function Root() {
  const [app, setApp] = React.useState<React.ComponentType | null>(null)
  const [failure, setFailure] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        await LoadSkiaWeb({ locateFile: () => canvaskitWasm })
        const { default: App } = await import("./App")
        if (!cancelled) setApp(() => App)
      } catch (cause) {
        if (!cancelled) {
          setFailure(cause instanceof Error ? cause.message : String(cause))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (failure !== null) {
    return (
      <MobileHost style={styles.fill}>
        <View style={styles.center}>
          <MobileAlert
            variant="destructive"
            title="The Skia runtime did not load"
          >
            {`${failure}\n\nCharts, sparklines and progress rings are drawn with Skia and cannot render without it.`}
          </MobileAlert>
        </View>
      </MobileHost>
    )
  }

  if (app === null) {
    return (
      <MobileHost style={styles.fill}>
        <View style={styles.center}>
          <MobileSpinner size="large" label="Loading the Skia runtime…" />
        </View>
      </MobileHost>
    )
  }

  const App = app
  return <App />
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
})
