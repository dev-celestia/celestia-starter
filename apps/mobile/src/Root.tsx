/**
 * Root — **native** (default) variant.
 *
 * On iOS and Android Skia is a native module that is already installed by the
 * time React starts, so the app can be imported and rendered immediately.
 * Nothing needs to be fetched and there is nothing to wait for.
 *
 * Metro resolves `./Root` to this file on native and to `Root.web.tsx` in the
 * browser. That split exists for one reason: on web the Skia module has to be
 * imported *after* CanvasKit is on the global object, and the only way to
 * control import order is to make the import itself dynamic — see
 * `Root.web.tsx`.
 */

export { default as Root } from "./App"
