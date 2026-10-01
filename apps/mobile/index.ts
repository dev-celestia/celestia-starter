import { registerRootComponent } from "expo"
import { Root } from "./src/Root"

// `./src/Root` is platform-split: `Root.tsx` renders the app directly on native,
// while `Root.web.tsx` loads CanvasKit first and then imports the app. The app
// itself is the same on both targets.
registerRootComponent(Root)
