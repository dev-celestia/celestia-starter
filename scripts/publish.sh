#!/usr/bin/env bash
# ============================================================
#  publish.sh — Publish @celestia-project packages to npm
#
#  Usage:
#    bash scripts/publish.sh                         # publish all
#    bash scripts/publish.sh --pkg ui                # publish only ui
#    bash scripts/publish.sh --pkg cli               # publish only cli
#    bash scripts/publish.sh --pkg mobile            # publish only mobile
#    bash scripts/publish.sh --bump patch            # bump all + publish
#    bash scripts/publish.sh --pkg ui --bump minor   # bump ui only + publish
#    bash scripts/publish.sh --dry-run               # dry run all
#    bash scripts/publish.sh --pkg ui --dry-run      # dry run ui only
# ============================================================
set -euo pipefail

# ── colours ─────────────────────────────────────────────────
BOLD=$(tput bold 2>/dev/null || echo "")
RED=$(tput setaf 1 2>/dev/null || echo "")
GREEN=$(tput setaf 2 2>/dev/null || echo "")
YELLOW=$(tput setaf 3 2>/dev/null || echo "")
CYAN=$(tput setaf 6 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")

info()    { echo "${CYAN}${BOLD}[INFO]${RESET}  $*"; }
success() { echo "${GREEN}${BOLD}[OK]${RESET}    $*"; }
warn()    { echo "${YELLOW}${BOLD}[WARN]${RESET}  $*"; }
error()   { echo "${RED}${BOLD}[ERROR]${RESET} $*" >&2; exit 1; }

# ── all publishable packages ─────────────────────────────────
get_pkg_dir() {
  case "$1" in
    ui) echo "packages/ui" ;;
    cli) echo "packages/cli" ;;
    mobile) echo "packages/mobile" ;;
    *) echo "" ;;
  esac
}

# ── parse args ───────────────────────────────────────────────
DRY_RUN=""
BUMP=""
TARGET=""   # empty = all packages

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)  DRY_RUN="--dry-run" ;;
    --bump)     BUMP="${2:?'--bump requires: patch | minor | major'}"; shift ;;
    --pkg)      TARGET="${2:?'--pkg requires a package name: ui | cli | mobile'}"; shift ;;
    *) error "Unknown argument: $1" ;;
  esac
  shift
done

# Validate --pkg value
if [[ -n "$TARGET" ]]; then
  PKG_DIR=$(get_pkg_dir "$TARGET")
  if [[ -z "$PKG_DIR" ]]; then
    error "Unknown package \"${TARGET}\". Valid options: ui, cli, mobile"
  fi
  SELECTED=("$TARGET")
else
  SELECTED=("ui" "cli" "mobile")
fi

# Respect a stable publish order: ui first, then cli, then mobile
ORDERED=()
for KEY in ui cli mobile; do
  for S in "${SELECTED[@]}"; do
    if [[ "$S" == "$KEY" ]]; then ORDERED+=("$KEY"); fi
  done
done

[[ -n "$DRY_RUN" ]] && warn "DRY RUN — nothing will actually be published."

# ── 1. check npm auth ────────────────────────────────────────
info "Checking npm authentication..."
NPM_USER=$(npm whoami --registry https://registry.npmjs.org 2>/dev/null || true)
if [[ -z "$NPM_USER" ]]; then
  error "Not logged in to npm. Run: npm login --registry https://registry.npmjs.org"
fi
success "Logged in as: ${BOLD}$NPM_USER${RESET}"

# ── 2. check org membership ─────────────────────────────────
info "Verifying access to @celestia-project org..."
ORG_MEMBERS=$(npm org ls celestia-project 2>/dev/null || true)
if [[ -z "$ORG_MEMBERS" ]]; then
  warn "Could not verify org membership (you may still have access). Continuing..."
else
  success "Org membership confirmed."
fi

# ── 3. ensure git is clean ───────────────────────────────────
if [[ "${SKIP_GIT_CHECK:-}" != "1" ]]; then
  if ! git diff --quiet || ! git diff --cached --quiet; then
    error "Working tree is dirty. Commit or stash your changes before publishing."
  fi
  success "Git working tree is clean."
fi

# ── 4. install & build ───────────────────────────────────────
info "Installing dependencies..."
pnpm install --frozen-lockfile

# Only build ui if it's in the target set (mobile ships source directly — no build step)
for KEY in "${ORDERED[@]}"; do
  if [[ "$KEY" == "ui" ]]; then
    info "Building @celestia-project/ui..."
    pnpm --filter '@celestia-project/ui' build
    break
  fi
done

# ── 5. bump versions (if requested) ─────────────────────────
if [[ -n "$BUMP" ]]; then
  echo ""
  info "Bumping ${BOLD}${BUMP}${RESET} version for: ${ORDERED[*]}"
  for KEY in "${ORDERED[@]}"; do
    PKG_DIR=$(get_pkg_dir "$KEY")
    PKG_NAME=$(node -p "require('./${PKG_DIR}/package.json').name")
    OLD_VER=$(node -p "require('./${PKG_DIR}/package.json').version")

    # Calculate new version via node semver logic
    NEW_VER=$(node -e "
      const [ma, mi, pa] = '${OLD_VER}'.split('.').map(Number);
      const bumped = { patch: [ma, mi, pa+1], minor: [ma, mi+1, 0], major: [ma+1, 0, 0] }['${BUMP}'];
      process.stdout.write(bumped.join('.'));
    ")

    # Write new version into package.json
    node -e "
      const fs = require('fs');
      const p = JSON.parse(fs.readFileSync('${PKG_DIR}/package.json', 'utf-8'));
      p.version = '${NEW_VER}';
      fs.writeFileSync('${PKG_DIR}/package.json', JSON.stringify(p, null, 2) + '\n');
    "
    success "Bumped ${PKG_NAME}: ${OLD_VER} → ${NEW_VER}"
  done
  echo ""
  warn "Version files updated. Commit them before the next publish:"
  echo "  git add ${ORDERED[*]/#/packages/}/package.json"
  echo "  git commit -m \"chore: bump ${BUMP} version\""
  echo ""

  if [[ -z "$DRY_RUN" ]]; then
    read -r -p "${YELLOW}${BOLD}[WARN]${RESET}  Continue to publish? [y/N] " CONFIRM
    CONFIRM_LOWER=$(echo "$CONFIRM" | tr '[:upper:]' '[:lower:]')
    [[ "$CONFIRM_LOWER" != "y" && "$CONFIRM_LOWER" != "yes" ]] && { info "Aborted."; exit 0; }
  fi
fi

# ── 6. publish each package ──────────────────────────────────
echo ""
PUBLISHED=()
for KEY in "${ORDERED[@]}"; do
  PKG_DIR=$(get_pkg_dir "$KEY")
  PKG_NAME=$(node -p "require('./${PKG_DIR}/package.json').name")
  PKG_VER=$(node -p "require('./${PKG_DIR}/package.json').version")

  echo "${BOLD}─────────────────────────────────────────${RESET}"
  info "Publishing ${CYAN}${PKG_NAME}${RESET} @ ${PKG_VER}"

  # Check if this exact version is already published
  PUBLISHED_VER=$(npm view "${PKG_NAME}" version \
    --registry https://registry.npmjs.org \
    --json 2>/dev/null \
    | tr -d '"' || true)
  if [[ "$PUBLISHED_VER" == "$PKG_VER" ]]; then
    warn "${PKG_NAME}@${PKG_VER} is already published — skipping."
    continue
  fi

  pnpm publish \
    --filter "${PKG_NAME}" \
    --access public \
    --no-git-checks \
    $DRY_RUN

  success "Published ${PKG_NAME}@${PKG_VER}"
  PUBLISHED+=("${PKG_NAME}@${PKG_VER}")
done

# ── 7. summary ───────────────────────────────────────────────
echo ""
echo "${BOLD}─────────────────────────────────────────${RESET}"
if [[ -n "$DRY_RUN" ]]; then
  warn "Dry run complete. Remove --dry-run to publish."
else
  success "Done! 🎉"
  if [[ ${#PUBLISHED[@]} -gt 0 ]]; then
    echo ""
    for PKG in "${PUBLISHED[@]}"; do
      PKG_PATH="${PKG%@*}"  # strip @version
      echo "  ${CYAN}${PKG}${RESET} → https://www.npmjs.com/package/${PKG_PATH}"
    done
  fi
fi
