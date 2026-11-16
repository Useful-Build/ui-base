#!/usr/bin/env bash
# End-to-end proof for the registry: install it from GitHub into fresh Vite and Next.js apps and check it holds.
#
#   e2e/run.sh <ref>          ref = a pushed branch, tag or commit SHA (default: this checkout's HEAD SHA)
#   VERIFY_DIR=<dir>          where the summary, logs, screenshots and reports go (default: ./verify/e2e)
#   KEEP_WORK=1               keep the temp apps afterwards
#
# On the Mac, run it through the heavy-job lock:
#   HEAVY_MAX_SECONDS=3000 ~/.agents/tools/heavy-lock.sh e2e/run.sh feat/registry-v1
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
REPO="wasimjalali/ui-base"
REF="${1:-$(git -C "$ROOT" rev-parse HEAD)}"
SHADCN=(npx -y shadcn@4.23.0)
VERIFY="${VERIFY_DIR:-$ROOT/verify/e2e}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/ui-base-e2e.XXXXXX")"
ROUTES="/,/?open=dialog,/?open=dropdown,/?open=select,/?open=popover,/?open=tooltip,/?open=sheet,/?open=command"
export UI_ROUTES="$ROUTES" CI=1

mkdir -p "$VERIFY/logs"
SUMMARY="$VERIFY/summary.md"
{
  echo "# ui-base E2E"
  echo
  echo "- Ref: \`$REPO#$REF\` ($(git -C "$ROOT" ls-remote origin "$REF" 2>/dev/null | head -1 | cut -c1-12 || true))"
  echo "- Started: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "- Work dir: \`$WORK\`"
  echo
  echo "| Step | Expected | Result |"
  echo "|---|---|---|"
} > "$SUMMARY"

FAILED=0
cleanup() {
  [ "${KEEP_WORK:-0}" = 1 ] || rm -rf "$WORK"
  echo "- Finished: $(date '+%Y-%m-%d %H:%M:%S'), $([ $FAILED = 0 ] && echo 'all steps passed' || echo "$FAILED step(s) failed")" >> "$SUMMARY"
}
trap cleanup EXIT

# step <name> <expect: pass|fail> <command...>: runs in the current dir, logs to logs/<name>.log.
step() {
  local name="$1" expect="$2"; shift 2
  local log="$VERIFY/logs/$name.log"
  echo "==> $name (expect $expect)"
  "$@" > "$log" 2>&1
  local code=$?
  local ok=0
  if [ "$expect" = pass ] && [ $code = 0 ]; then ok=1; fi
  if [ "$expect" = fail ] && [ $code != 0 ]; then ok=1; fi
  if [ $ok = 1 ]; then
    echo "| $name | $expect | PASS (exit $code) |" >> "$SUMMARY"
  else
    echo "| $name | $expect | **FAIL** (exit $code, see logs/$name.log) |" >> "$SUMMARY"
    FAILED=$((FAILED + 1))
    tail -40 "$log"
  fi
  return $((1 - ok))
}

# A setup step that later steps depend on: stop the run if it fails.
must() { step "$@" || exit 1; }

# app <kind: vite|next>
app() {
  local kind="$1" item token_file page check_dirs
  if [ "$kind" = vite ]; then
    item=base; token_file=src/index.css; page=src/App.tsx; check_dirs="src"
  else
    item=base-next; token_file=app/globals.css; page=app/page.tsx; check_dirs="app components lib"
  fi
  local dir="$WORK/$kind-app" out="$VERIFY/$kind"
  mkdir -p "$out"

  cd "$WORK" || exit 1
  must "$kind-init" pass "${SHADCN[@]}" init --template "$kind" --name "$kind-app" -b radix -p nova -y --no-monorepo
  cd "$dir" || exit 1
  must "$kind-add-$item" pass "${SHADCN[@]}" add "$REPO/$item#$REF" -y --overwrite
  # The installed token file must be ours, whole.
  must "$kind-token-file-installed" pass cmp "$ROOT/registry/styles/tokens.css" "$token_file"
  cp "$HERE/fixtures/kitchen-sink.tsx" "$page"

  if [ "$kind" = vite ]; then
    step "$kind-typecheck" pass npx tsc --noEmit -p tsconfig.app.json
  else
    step "$kind-typecheck" pass npx tsc --noEmit
  fi
  step "$kind-build" pass npm run build
  npm pkg set "scripts.lint:tokens=node scripts/check-tokens.mjs $check_dirs"
  step "$kind-lint-tokens" pass npm run lint:tokens

  must "$kind-add-regression-suite" pass "${SHADCN[@]}" add "$REPO/regression-suite#$REF" -y --overwrite
  must "$kind-playwright-install" pass npx playwright install chromium
  UI_OUT_DIR="$out/run1" step "$kind-suite-run1-write-baselines" pass npx playwright test e2e/ui/visual.spec.ts --update-snapshots
  UI_OUT_DIR="$out/run2" step "$kind-suite-run2-visual-and-a11y" pass npx playwright test

  # Negative 1: a hard-coded color must fail the token check.
  cp "$page" "$WORK/page.keep"
  perl -0pi -e 's#<main className="#<main data-negative className="bg-[\#ff0000] #' "$page"
  grep -q 'bg-\[#ff0000\]' "$page" || { echo "negative edit did not apply to $page"; exit 1; }
  step "$kind-negative-hardcoded-color" fail npm run lint:tokens
  cp "$WORK/page.keep" "$page"

  # Negative 2: a changed token must fail the visual suite.
  cp "$token_file" "$WORK/tokens.keep"
  perl -0pi -e 's#(:root \{.*?--primary: )\#171717;#${1}\#2d3bea;#s' "$token_file"
  ! cmp -s "$token_file" "$WORK/tokens.keep" || { echo "negative edit did not apply to $token_file"; exit 1; }
  UI_OUT_DIR="$out/negative-primary" step "$kind-negative-changed-primary" fail npx playwright test e2e/ui/visual.spec.ts
  cp "$WORK/tokens.keep" "$token_file"

  must "$kind-reverted" pass bash -c "cmp '$ROOT/registry/styles/tokens.css' '$token_file' && cmp '$HERE/fixtures/kitchen-sink.tsx' '$page'"

  mkdir -p "$out/screenshots"
  cp e2e/ui/visual.spec.ts-snapshots/*.png "$out/screenshots/"
}

cd "$ROOT" || exit 1
must "validate-registry" pass "${SHADCN[@]}" registry validate "$REPO#$REF"
app vite
app next

[ $FAILED = 0 ]
