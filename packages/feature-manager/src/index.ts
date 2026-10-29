export type {
  Feature,
  FeatureCopy,
  FeatureInsertion,
  FeatureJsonAppend,
  FeatureManifest,
  FeatureNavItem,
  FeatureTracker,
  InstalledFeature,
  InsertionReport,
  WarningReport,
  WarningType,
} from "./types.js"
export { MANAGER_DIR } from "./types.js"

export {
  appendToJsonArray,
  hasRegion,
  insertIntoRegion,
  insertIntoRegionDetailed,
  isValidMarker,
  jsonAppend,
  jsonRemove,
  listAvailableMarkers,
  listRegionFeatures,
  MarkerError,
  removeFromJsonArray,
  removeFromRegion,
  removeFromRegionDetailed,
  unwrapSentinel,
} from "./markers.js"
export type { InsertResult, RemoveResult } from "./markers.js"

export {
  getFeature,
  getFeatures,
  getNavItems,
  hasFeature,
  registerFeature,
  unregisterFeature,
} from "./registry.js"

export {
  availableFeatureNames,
  discoverFeatures,
  loadManifest,
  normalizeManifest,
  normalizeRel,
  validateManifest,
} from "./manifest.js"
export type {
  DiscoveredFeature,
  ManifestValidation,
  NormalizedManifest,
  ValidateOptions,
} from "./manifest.js"

export {
  describePlan,
  executeInstall,
  installFeature,
  planInstall,
} from "./installer.js"
export type {
  CopyPlan,
  DepPlan,
  InstallOptions,
  InstallPlan,
  InstallReport,
  InsertionPlan,
  JsonPlan,
  PlanResult,
} from "./installer.js"

export { executeRemove, planRemove, removeFeature } from "./remover.js"
export type {
  DepRemovalPlan,
  FileRemovalPlan,
  InsertionRemovalPlan,
  JsonRemovalPlan,
  RemoveOptions,
  RemovePlan,
  RemoveReport,
} from "./remover.js"

export { verify } from "./verifier.js"
export type { FeatureVerification, IssueCode, VerifyIssue, VerifyReport } from "./verifier.js"

export {
  allocateSeq,
  claimers,
  currentOwner,
  installOrder,
  previousOwner,
  readTracker,
  writeTracker,
} from "./state.js"

export {
  backupPathFor,
  readJson,
  removeEmptyParents,
  sha256,
  sha256File,
  stringifyJson,
  writeFileAtomic,
  writeJson,
} from "./fsx.js"

export {
  displayPath,
  featurePath,
  findRepoRoot,
  isInside,
  PathEscapeError,
  repoContext,
  repoPath,
  resolveInside,
} from "./paths.js"
export type { RepoContext } from "./paths.js"

export { FileTransaction } from "./txn.js"

export { generateVerificationPrompt, saveVerificationPrompt } from "./prompt.js"
export type { PromptGenerationParams } from "./prompt.js"
