#!/usr/bin/env tsx

import { addFeature } from "./add.js"
import { listFeatures } from "./list.js"
import { promptFeature } from "./prompt.js"
import { removeFeature } from "./remove.js"

const [command, ...args] = process.argv.slice(2)

switch (command) {
  case "add":
    addFeature(args[0])
    break
  case "remove":
    removeFeature(args[0])
    break
  case "list":
    listFeatures()
    break
  case "prompt":
    promptFeature(args[0])
    break
  default:
    console.log(`
feature-manager — plugin system for celestia-starter

Usage:
  feature-manager add <name>    Install a feature from features/
  feature-manager remove <name> Uninstall an installed feature
  feature-manager list          List available and installed features
  feature-manager prompt <name> Generate AI verification prompt for a feature
`)
    break
}
