#!/usr/bin/env bash
# End-to-end proof for the registry: install it from GitHub into fresh Vite and Next.js apps and check it holds.
#
#   e2e/run.sh <ref>          ref = a pushed branch, tag or commit SHA (default: this checkout's HEAD SHA)
#   VERIFY_DIR=<dir>          where the summary, logs, screenshots and reports go (default: ./verify/e2e)
#   KEEP_WORK=1               keep the temp apps afterwards
#
# On the Mac, run it through the heavy-job lock:
#   HEAVY_MAX_SECONDS=3600 ~/.agents/tools/heavy-lock.sh e2e/run.sh feat/registry-v1
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

# The brand an app sets in its own CSS file for the update-path check.
PRIMARY_LIGHT='#1d6b3a' PRIMARY_DARK='#7fd49b' BRAND_LIGHT='#c2410c' BRAND_DARK='#fb923c'

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

record_fail() { # <name> <detail>
  echo "| $1 | - | **FAIL** ($2) |" >> "$SUMMARY"
  FAILED=$((FAILED + 1))
}

# Stop the run, recording why, so the summary never reads "all steps passed" after an early exit.
abort() { # <name> <detail>
  echo "ABORT $1: $2"
  record_fail "$1" "$2"
  exit 1
}

# step <name> <expect: pass|fail> <command...>: runs in the current dir, logs to logs/<name>.log.
# With expect=fail, set STEP_REASON to an extended regex the log must contain, so the step only counts when it failed
# for the reason it's meant to prove. Any other failure fails the step.
step() {
  local name="$1" expect="$2"; shift 2
  local log="$VERIFY/logs/$name.log" reason="${STEP_REASON:-}"
  echo "==> $name (expect $expect)"
  "$@" > "$log" 2>&1
  local code=$?
  local ok=0 note=""
  if [ "$expect" = pass ] && [ $code = 0 ]; then ok=1; fi
  if [ "$expect" = fail ] && [ $code != 0 ]; then
    if [ -z "$reason" ] || grep -Eq "$reason" "$log"; then ok=1; else note=", log lacks /$reason/"; fi
  fi
  if [ $ok = 1 ]; then
    echo "| $name | $expect${reason:+ (/$reason/)} | PASS (exit $code) |" >> "$SUMMARY"
  else
    echo "| $name | $expect${reason:+ (/$reason/)} | **FAIL** (exit $code$note, see logs/$name.log) |" >> "$SUMMARY"
    FAILED=$((FAILED + 1))
    tail -40 "$log"
  fi
  return $((1 - ok))
}

# A setup step that later steps depend on: stop the run if it fails (step has already recorded the row).
must() { step "$@" || exit 1; }

# lacks <text> <file>: the file exists and doesn't contain the text.
lacks() { [ -f "$2" ] && ! grep -qF -- "$1" "$2"; }

# copy_shots <dest>: the visual baselines, which must exist.
copy_shots() {
  local dest="$1" shots
  shots=(e2e/ui/visual.spec.ts-snapshots/*.png)
  [ -e "${shots[0]}" ] || abort "copy-shots-$(basename "$dest")" "no baselines in e2e/ui/visual.spec.ts-snapshots"
  mkdir -p "$dest"
  cp "${shots[@]}" "$dest/"
}

# app <kind: vite|next>
app() {
  local kind="$1" item update_item app_css starter ui_css page check_dirs
  if [ "$kind" = vite ]; then
    item=base; update_item=update; app_css=src/index.css; starter=app.css; ui_css=src/ui-base.css; icon_tsx=src/components/ui/icon.tsx
    page=src/App.tsx; check_dirs="src"
  else
    item=base-next; update_item=update-next; app_css=app/globals.css; starter=app-next.css; ui_css=app/ui-base.css; icon_tsx=components/ui/icon.tsx
    page=app/page.tsx; check_dirs="app components lib"
  fi
  local dir="$WORK/$kind-app" out="$VERIFY/$kind"
  mkdir -p "$out"
  export UI_ROUTES="$ROUTES"

  cd "$WORK" || abort "$kind-cd-work" "cannot cd to $WORK"
  must "$kind-init" pass "${SHADCN[@]}" init --template "$kind" --name "$kind-app" -b radix -p nova -y --no-monorepo
  cd "$dir" || abort "$kind-cd-app" "cannot cd to $dir"
  must "$kind-add-$item" pass "${SHADCN[@]}" add "$REPO/$item#$REF" -y --overwrite
  # The base-owned token file and the app CSS starter must both be ours, whole.
  must "$kind-ui-base-css-installed" pass cmp "$ROOT/registry/styles/ui-base.css" "$ui_css"
  must "$kind-app-css-starter-installed" pass cmp "$ROOT/registry/styles/$starter" "$app_css"
  cp "$HERE/fixtures/kitchen-sink.tsx" "$page"
  if [ "$kind" = next ]; then
    # A server component page (no "use client") importing client-only components must still build.
    mkdir -p app/server-check
    cp "$HERE/fixtures/server-page.tsx" app/server-check/page.tsx
    # Fonts come from next/font in layout.tsx, so the fontsource packages must not be installed.
    step "$kind-no-fontsource" pass lacks fontsource package.json
  fi

  if [ "$kind" = vite ]; then
    step "$kind-typecheck" pass npx tsc --noEmit -p tsconfig.app.json
  else
    step "$kind-typecheck" pass npx tsc --noEmit
  fi
  step "$kind-build" pass npm run build
  if [ "$kind" = next ]; then
    step "$kind-server-component-page-built" pass grep -q ' /server-check' "$VERIFY/logs/$kind-build.log"
  fi
  npm pkg set "scripts.lint:tokens=node scripts/check-tokens.mjs $check_dirs"
  step "$kind-lint-tokens" pass npm run lint:tokens

  must "$kind-add-regression-suite" pass "${SHADCN[@]}" add "$REPO/regression-suite#$REF" -y --overwrite
  must "$kind-playwright-install" pass npx playwright install chromium
  UI_OUT_DIR="$out/run1" step "$kind-suite-run1-write-baselines" pass npx playwright test e2e/ui/visual.spec.ts --update-snapshots
  UI_OUT_DIR="$out/run2" step "$kind-suite-run2-visual-and-a11y" pass npx playwright test

  # Negative 1: a hard-coded color must fail the token check, and for that color.
  cp "$page" "$WORK/page.keep"
  perl -0pi -e 's#<main className="#<main data-negative className="bg-[\#ff0000] #' "$page"
  grep -q 'bg-\[#ff0000\]' "$page" || abort "$kind-negative-hardcoded-color" "negative edit did not apply to $page"
  STEP_REASON='ff0000' step "$kind-negative-hardcoded-color" fail npm run lint:tokens
  cp "$WORK/page.keep" "$page"

  # Negative 2: a changed base token must fail the visual suite, on a pixel diff.
  cp "$ui_css" "$WORK/ui-base.keep"
  perl -0pi -e 's#(:root \{.*?--primary: )\#171717;#${1}\#2d3bea;#s' "$ui_css"
  ! cmp -s "$ui_css" "$WORK/ui-base.keep" || abort "$kind-negative-changed-primary" "negative edit did not apply to $ui_css"
  UI_OUT_DIR="$out/negative-primary" STEP_REASON='pixels \(ratio [0-9.]+ of all image pixels\) are different' \
    step "$kind-negative-changed-primary" fail npx playwright test e2e/ui/visual.spec.ts
  cp "$WORK/ui-base.keep" "$ui_css"

  must "$kind-reverted-ui-base-css" pass cmp "$ROOT/registry/styles/ui-base.css" "$ui_css"
  must "$kind-reverted-page" pass cmp "$HERE/fixtures/kitchen-sink.tsx" "$page"
  copy_shots "$out/screenshots-base"

  # ---------- update path: the app restyles itself and adds a route, then updates the base ----------
  perl -0pi -e "s|\n:root \{\n\}\n|\n:root {\n  --primary: $PRIMARY_LIGHT;\n  --brand: $BRAND_LIGHT;\n}\n|; s|\n\.dark \{\n\}\n|\n.dark {\n  --primary: $PRIMARY_DARK;\n  --brand: $BRAND_DARK;\n}\n|" "$app_css"
  [ "$(grep -cE -- "--(primary|brand): #" "$app_css")" = 4 ] || abort "$kind-override-brand" "override edit did not apply to $app_css"
  perl -0pi -e "s#: \['/'\]#: ['/', '/?open=dialog']#" e2e/ui/routes.ts
  grep -qF "['/', '/?open=dialog']" e2e/ui/routes.ts || abort "$kind-add-route" "route edit did not apply to e2e/ui/routes.ts"
  # From here the suite reads the app's own routes.ts.
  unset UI_ROUTES
  mv e2e/ui/visual.spec.ts-snapshots "$WORK/$kind-snapshots-base" || abort "$kind-move-baselines" "cannot move the first baselines aside"
  UI_OUT_DIR="$out/update-baselines" step "$kind-update-write-overridden-baselines" pass npx playwright test e2e/ui/visual.spec.ts --update-snapshots

  cp "$app_css" "$WORK/app-css.keep"
  cp e2e/ui/routes.ts "$WORK/routes.keep"
  # The icon seam is app-owned: an app that swapped its icon set must keep it.
  echo '// app icon set' >> "$icon_tsx"
  cp "$icon_tsx" "$WORK/icon.keep"
  # Make base-owned files stale, so the update has to rewrite them.
  echo '/* stale */' >> "$ui_css"
  echo '// stale' >> e2e/ui/visual.spec.ts
  must "$kind-add-$update_item" pass "${SHADCN[@]}" add "$REPO/$update_item#$REF" -y --overwrite
  must "$kind-add-regression-suite-update" pass "${SHADCN[@]}" add "$REPO/regression-suite-update#$REF" -y --overwrite
  step "$kind-update-kept-app-css" pass cmp "$WORK/app-css.keep" "$app_css"
  step "$kind-update-kept-routes" pass cmp "$WORK/routes.keep" e2e/ui/routes.ts
  step "$kind-update-kept-icon" pass cmp "$WORK/icon.keep" "$icon_tsx"
  step "$kind-update-rewrote-ui-base-css" pass cmp "$ROOT/registry/styles/ui-base.css" "$ui_css"
  step "$kind-update-rewrote-suite" pass cmp "$ROOT/registry/regression/e2e/ui/visual.spec.ts" e2e/ui/visual.spec.ts

  step "$kind-update-build" pass npm run build
  step "$kind-update-lint-tokens" pass npm run lint:tokens
  UI_OUT_DIR="$out/update" step "$kind-update-suite-visual-and-a11y" pass npx playwright test
  # 2 routes x 2 themes x 2 projects x 2 specs: both routes ran.
  step "$kind-update-suite-ran-both-routes" pass grep -Eq '\b16 passed\b' "$VERIFY/logs/$kind-update-suite-visual-and-a11y.log"

  cp "$HERE/fixtures/checks.spec.ts" e2e/ui/zz-checks.spec.ts
  local font='Geist Variable' not_font=''
  if [ "$kind" = next ]; then font='Geist'; not_font='Geist Variable'; fi
  UI_OUT_DIR="$out/checks" EXPECT_PRIMARY_LIGHT="$PRIMARY_LIGHT" EXPECT_PRIMARY_DARK="$PRIMARY_DARK" \
    EXPECT_BRAND_LIGHT="$BRAND_LIGHT" EXPECT_BRAND_DARK="$BRAND_DARK" EXPECT_FONT="$font" EXPECT_NOT_FONT="$not_font" \
    step "$kind-override-applies-and-font" pass npx playwright test e2e/ui/zz-checks.spec.ts --project=desktop
  rm e2e/ui/zz-checks.spec.ts

  copy_shots "$out/screenshots-override"
}

cd "$ROOT" || abort "cd-root" "cannot cd to $ROOT"
must "validate-registry" pass "${SHADCN[@]}" registry validate "$REPO#$REF"
app vite
app next

[ $FAILED = 0 ]
