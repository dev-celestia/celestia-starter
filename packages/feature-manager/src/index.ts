export type {
  Feature,
  FeatureCopy,
  FeatureInsertion,
  FeatureJsonAppend,
  FeatureManifest,
  FeatureNavItem,
  FeatureTracker,
  InstalledFeature,
} from "./types.js"

export {
  insertIntoRegion,
  removeFromRegion,
  jsonAppend,
  jsonRemove,
} from "./markers.js"

export {
  getFeature,
  getFeatures,
  getNavItems,
  hasFeature,
  registerFeature,
  unregisterFeature,
} from "./registry.js"

export {
  generateVerificationPrompt,
  saveVerificationPrompt,
} from "./prompt.js"
export type {
  InsertionReport,
  PromptGenerationParams,
  WarningReport,
} from "./prompt.js"
