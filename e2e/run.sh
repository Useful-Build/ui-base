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
  local kind="$1" item update_item app_css starter ui_css page check_dirs ui_dir lib_utils art tsc
  if [ "$kind" = vite ]; then
    item=base; update_item=update; app_css=src/index.css; starter=app.css; ui_css=src/ui-base.css; ui_dir=src/components/ui
    lib_utils=src/lib/utils.ts; page=src/App.tsx; check_dirs="src"; art=src/art-preview.ts; tsc="npx tsc --noEmit -p tsconfig.app.json"
  else
    item=base-next; update_item=update-next; app_css=app/globals.css; starter=app-next.css; ui_css=app/ui-base.css; ui_dir=components/ui
    lib_utils=lib/utils.ts; page=app/page.tsx; check_dirs="app components lib"; art=lib/art-preview.ts; tsc="npx tsc --noEmit"
  fi
  local icon_tsx="$ui_dir/icon.tsx" icon_names="$ui_dir/icon-names.ts" allow=scripts/check-tokens.allow.json
  local merge_config="$(dirname "$lib_utils")/merge-config.ts"
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
  must "$kind-icon-names-installed" pass cmp "$ROOT/registry/ui/icon-names.ts" "$icon_names"
  must "$kind-allow-list-installed-empty" pass cmp "$ROOT/registry/scripts/check-tokens.allow.json" "$allow"
  must "$kind-merge-config-installed" pass cmp "$ROOT/registry/lib/merge-config.ts" "$merge_config"
  cp "$HERE/fixtures/kitchen-sink.tsx" "$page"
  if [ "$kind" = next ]; then
    # A server component page (no "use client") importing client-only components must still build.
    mkdir -p app/server-check
    cp "$HERE/fixtures/server-page.tsx" app/server-check/page.tsx
    # Fonts come from next/font in layout.tsx, so the fontsource packages must not be installed.
    step "$kind-no-fontsource" pass lacks fontsource package.json
  fi

  step "$kind-typecheck" pass $tsc

  # Negative: a release that adds an icon name (as a newer icon-names.ts would) must fail the app's type check, in
  # its old icon.tsx, until the app maps the name.
  perl -0pi -e 's#(export const ICON_NAMES = \[\n)#${1}  "zz_new_icon",\n#' "$icon_names"
  grep -q '"zz_new_icon"' "$icon_names" || abort "$kind-negative-new-icon-name" "negative edit did not apply to $icon_names"
  STEP_REASON="Property 'zz_new_icon' is missing" step "$kind-negative-new-icon-name" fail $tsc
  cp "$ROOT/registry/ui/icon-names.ts" "$icon_names"
  step "$kind-build" pass npm run build
  if [ "$kind" = next ]; then
    step "$kind-server-component-page-built" pass grep -q ' /server-check' "$VERIFY/logs/$kind-build.log"
  fi
  npm pkg set "scripts.lint:tokens=node scripts/check-tokens.mjs $check_dirs"
  step "$kind-lint-tokens" pass npm run lint:tokens

  # Negative: overriding a token ui-base.css doesn't define (a renamed or mistyped one) must fail the token check.
  perl -0pi -e 's|\n:root \{\n\}\n|\n:root {\n  --zz-renamed-token: 1px;\n}\n|' "$app_css"
  grep -qF -- '--zz-renamed-token' "$app_css" || abort "$kind-negative-unknown-token-override" "negative edit did not apply to $app_css"
  STEP_REASON='css:[0-9]+  --zz-renamed-token  is not defined in ui-base\.css' \
    step "$kind-negative-unknown-token-override" fail npm run lint:tokens
  cp "$ROOT/registry/styles/$starter" "$app_css"
  # An app-only token with the --app- prefix is fine, in both blocks.
  perl -0pi -e 's|\n:root \{\n\}\n|\n:root {\n  --app-foo: 1px;\n}\n|; s|\n\.dark \{\n\}\n|\n.dark {\n  --app-foo: 2px;\n}\n|' "$app_css"
  [ "$(grep -cF -- '--app-foo' "$app_css")" = 2 ] || abort "$kind-app-prefixed-token-override" "edit did not apply to $app_css"
  step "$kind-app-prefixed-token-override" pass npm run lint:tokens
  cp "$ROOT/registry/styles/$starter" "$app_css"

  must "$kind-add-regression-suite" pass "${SHADCN[@]}" add "$REPO/regression-suite#$REF" -y --overwrite
  must "$kind-playwright-install" pass npx playwright install chromium
  UI_OUT_DIR="$out/run1" step "$kind-suite-run1-write-baselines" pass npx playwright test -c playwright.ui.config.ts e2e/ui/visual.spec.ts --update-snapshots
  UI_OUT_DIR="$out/run2" step "$kind-suite-run2-visual-and-a11y" pass npx playwright test -c playwright.ui.config.ts

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
    step "$kind-negative-changed-primary" fail npx playwright test -c playwright.ui.config.ts e2e/ui/visual.spec.ts
  cp "$WORK/ui-base.keep" "$ui_css"

  must "$kind-reverted-ui-base-css" pass cmp "$ROOT/registry/styles/ui-base.css" "$ui_css"
  must "$kind-reverted-page" pass cmp "$HERE/fixtures/kitchen-sink.tsx" "$page"
  must "$kind-reverted-icon-names" pass cmp "$ROOT/registry/ui/icon-names.ts" "$icon_names"
  must "$kind-reverted-app-css" pass cmp "$ROOT/registry/styles/$starter" "$app_css"
  copy_shots "$out/screenshots-base"

  # ---------- update path: the app restyles itself and adds a route, then updates the base ----------
  perl -0pi -e "s|\n:root \{\n\}\n|\n:root {\n  --primary: $PRIMARY_LIGHT;\n  --brand: $BRAND_LIGHT;\n}\n|; s|\n\.dark \{\n\}\n|\n.dark {\n  --primary: $PRIMARY_DARK;\n  --brand: $BRAND_DARK;\n}\n|" "$app_css"
  [ "$(grep -cE -- "--(primary|brand): #" "$app_css")" = 4 ] || abort "$kind-override-brand" "override edit did not apply to $app_css"
  perl -0pi -e "s#: \['/'\]#: ['/', '/?open=dialog']#" e2e/ui/routes.ts
  grep -qF "['/', '/?open=dialog']" e2e/ui/routes.ts || abort "$kind-add-route" "route edit did not apply to e2e/ui/routes.ts"
  # The app adds its own axe exclusion and screenshot mask in routes.ts. The baselines below are written with the h1
  # masked, so the post-update suite run only passes if the updated spec still reads MASKS from the kept routes.ts.
  perl -0pi -e "s#AXE_EXCLUDE: Exclusion\[\] = \[\]#AXE_EXCLUDE: Exclusion[] = [{ rule: 'color-contrast', selector: '[data-app-excluded]', why: 'e2e app exclusion' }]#; s#MASKS: string\[\] = \[\]#MASKS: string[] = ['h1']#" e2e/ui/routes.ts
  grep -qF "[data-app-excluded]" e2e/ui/routes.ts && grep -qF "MASKS: string[] = ['h1']" e2e/ui/routes.ts \
    || abort "$kind-add-app-exclusion" "exclusion and mask edit did not apply to e2e/ui/routes.ts"
  # From here the suite reads the app's own routes.ts.
  unset UI_ROUTES
  mv e2e/ui/visual.spec.ts-snapshots "$WORK/$kind-snapshots-base" || abort "$kind-move-baselines" "cannot move the first baselines aside"
  UI_OUT_DIR="$out/update-baselines" step "$kind-update-write-overridden-baselines" pass npx playwright test -c playwright.ui.config.ts e2e/ui/visual.spec.ts --update-snapshots

  # The app allows a piece of content art in its own allow list (app-owned): it fails before, passes after.
  echo 'export const PREVIEW_FILL = "#ff0000"' > "$art"
  STEP_REASON="art-preview\.ts:1  #ff0000" step "$kind-negative-art-not-allowed-yet" fail npm run lint:tokens
  printf '["%s"]\n' "$art" > "$allow"
  step "$kind-allow-list-allows-art" pass npm run lint:tokens

  cp "$app_css" "$WORK/app-css.keep"
  cp e2e/ui/routes.ts "$WORK/routes.keep"
  cp "$allow" "$WORK/allow.keep"
  # The icon seam is app-owned: an app that swapped its icon set must keep it.
  echo '// app icon set' >> "$icon_tsx"
  cp "$icon_tsx" "$WORK/icon.keep"
  # The merge seam is app-owned too: an app that listed its own class names must keep them.
  echo '// app merge config' >> "$merge_config"
  cp "$merge_config" "$WORK/merge-config.keep"
  # Make base-owned files stale, so the update has to rewrite them.
  echo '/* stale */' >> "$ui_css"
  echo '// stale' >> e2e/ui/visual.spec.ts
  for f in "$ui_dir/button.tsx" scripts/check-tokens.mjs "$lib_utils" "$icon_names"; do echo '// stale' >> "$f"; done
  must "$kind-add-$update_item" pass "${SHADCN[@]}" add "$REPO/$update_item#$REF" -y --overwrite
  must "$kind-add-regression-suite-update" pass "${SHADCN[@]}" add "$REPO/regression-suite-update#$REF" -y --overwrite
  step "$kind-update-kept-app-css" pass cmp "$WORK/app-css.keep" "$app_css"
  step "$kind-update-kept-routes" pass cmp "$WORK/routes.keep" e2e/ui/routes.ts
  step "$kind-update-kept-app-exclusion" pass sh -c "grep -qF \"selector: '[data-app-excluded]'\" e2e/ui/routes.ts && grep -qF \"MASKS: string[] = ['h1']\" e2e/ui/routes.ts"
  step "$kind-update-kept-icon" pass cmp "$WORK/icon.keep" "$icon_tsx"
  step "$kind-update-kept-merge-config" pass cmp "$WORK/merge-config.keep" "$merge_config"
  step "$kind-update-kept-allow-list" pass cmp "$WORK/allow.keep" "$allow"
  step "$kind-update-rewrote-ui-base-css" pass cmp "$ROOT/registry/styles/ui-base.css" "$ui_css"
  step "$kind-update-rewrote-suite" pass cmp "$ROOT/registry/regression/e2e/ui/visual.spec.ts" e2e/ui/visual.spec.ts
  step "$kind-update-rewrote-button" pass cmp "$ROOT/registry/ui/button.tsx" "$ui_dir/button.tsx"
  step "$kind-update-rewrote-check-tokens" pass cmp "$ROOT/registry/scripts/check-tokens.mjs" scripts/check-tokens.mjs
  step "$kind-update-rewrote-utils" pass cmp "$ROOT/registry/lib/utils.ts" "$lib_utils"
  step "$kind-update-rewrote-icon-names" pass cmp "$ROOT/registry/ui/icon-names.ts" "$icon_names"

  step "$kind-update-build" pass npm run build
  step "$kind-update-lint-tokens" pass npm run lint:tokens
  # The allowed art still holds its literal, and the updated check still allows it.
  step "$kind-update-art-still-allowed" pass sh -c "grep -qF '#ff0000' '$art' && npm run lint:tokens"
  UI_OUT_DIR="$out/update" step "$kind-update-suite-visual-and-a11y" pass npx playwright test -c playwright.ui.config.ts
  # 2 routes x 2 themes x 2 projects x 2 specs: both routes ran.
  step "$kind-update-suite-ran-both-routes" pass grep -Eq '\b16 passed\b' "$VERIFY/logs/$kind-update-suite-visual-and-a11y.log"

  cp "$HERE/fixtures/checks.spec.ts" e2e/ui/zz-checks.spec.ts
  local font='Geist Variable' not_font=''
  if [ "$kind" = next ]; then font='Geist'; not_font='Geist Variable'; fi
  UI_OUT_DIR="$out/checks" EXPECT_PRIMARY_LIGHT="$PRIMARY_LIGHT" EXPECT_PRIMARY_DARK="$PRIMARY_DARK" \
    EXPECT_BRAND_LIGHT="$BRAND_LIGHT" EXPECT_BRAND_DARK="$BRAND_DARK" EXPECT_FONT="$font" EXPECT_NOT_FONT="$not_font" \
    step "$kind-override-applies-and-font" pass npx playwright test -c playwright.ui.config.ts e2e/ui/zz-checks.spec.ts --project=desktop
  rm e2e/ui/zz-checks.spec.ts

  copy_shots "$out/screenshots-override"
}

# App-owned files: installed once by the first-install items, never shipped by an update item.
APP_OWNED="registry/ui/icon.tsx,registry/lib/merge-config.ts,registry/styles/app.css,registry/styles/app-next.css,registry/scripts/check-tokens.allow.json,registry/regression/e2e/ui/routes.ts"

# Each update item must be its first-install item minus the app-owned files, with the same dependencies.
bundles_consistent() {
  node -e '
    const fs = require("fs")
    const reg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
    const appOwned = new Set(process.argv[2].split(","))
    const items = Object.fromEntries(reg.items.map(i => [i.name, i]))
    const key = f => JSON.stringify([f.path, f.type, f.target ?? null])
    let bad = 0
    const fail = msg => { console.error("DIFF " + msg); bad++ }
    for (const [first, update] of [["base", "update"], ["base-next", "update-next"], ["regression-suite", "regression-suite-update"]]) {
      const a = items[first], b = items[update]
      if (!a || !b) { fail(`missing item ${first} or ${update}`); continue }
      const want = a.files.filter(f => !appOwned.has(f.path)).map(key)
      const have = b.files.map(key)
      for (const k of want) if (!have.includes(k)) fail(`${update} lacks ${k}, which ${first} ships`)
      for (const k of have) if (!want.includes(k)) fail(`${update} ships ${k}, which is app-owned or not in ${first}`)
      if (new Set(have).size !== have.length) fail(`${update} lists a file twice`)
      for (const field of ["dependencies", "devDependencies"]) {
        const x = [...(a[field] ?? [])].sort().join(" "), y = [...(b[field] ?? [])].sort().join(" ")
        if (x !== y) fail(`${field} differ: ${first} [${x}], ${update} [${y}]`)
      }
      const owned = a.files.filter(f => appOwned.has(f.path)).map(f => f.path)
      console.log(`${first} -> ${update}: ${have.length} files, app-owned left out: ${owned.join(", ") || "none"}`)
    }
    if (bad) { console.error(`${bad} difference(s) between the first-install and update items`); process.exit(1) }
    console.log("bundles consistent")
  ' "$ROOT/registry.json" "$APP_OWNED"
}

# The token check against small fixtures: comments, var() exemptions and the lines that must still be flagged.
token_check_fixtures() {
  local check="$ROOT/registry/scripts/check-tokens.mjs"
  cd "$HERE/fixtures/tokens" || abort "token-fixtures-cd" "cannot cd to $HERE/fixtures/tokens"
  # flags <name> <dir> <reason>: the check fails on the fixture dir, and its output has the reason.
  flags() { STEP_REASON="$3" step "token-check-flags-$1" fail node "$check" "$2"; }
  step "token-check-fixtures-pass" pass node "$check" pass
  step "token-check-app-css-overrides-pass" pass sh -c "cd app-pass && node '$check' src"
  flags star-rule fail-star-rule 'star\.css:4  #f00 '
  flags between-comments fail-between-comments 'between\.css:1  #0f0 '
  flags after-comment-close fail-after-comment-close 'after\.css:2  #00f '
  flags before-line-comment fail-before-line-comment 'before\.tsx:1  #abcdef '
  flags literal-alpha fail-literal-alpha 'alpha\.css:1  rgb\(  \.z'
  flags relative-literal fail-relative-literal 'relative\.css:1  rgb\(  \.w'
  # A color function after a Tailwind _, in any case.
  flags underscore-rgb fail-underscore-funcs 'u\.tsx:1  rgb\( '
  flags underscore-rgba fail-underscore-funcs 'u\.tsx:2  rgba\( '
  flags underscore-oklch fail-underscore-funcs 'u\.tsx:3  oklch\( '
  flags underscore-hsl fail-underscore-funcs 'u\.tsx:4  hsl\( '
  flags upper-case-rgb fail-underscore-funcs 'u\.tsx:5  RGB\( '
  flags mixed-case-rgb fail-underscore-funcs 'u\.tsx:6  Rgb\( '
  # Named colors in CSS values, arbitrary values and style objects.
  flags named-border fail-named 'n\.css:1  red '
  flags named-box-shadow fail-named 'n\.css:2  black '
  flags named-gradient-stop fail-named 'n\.css:3  papayawhip '
  flags named-var-fallback fail-named 'n\.css:4  seagreen '
  flags named-arbitrary-shadow fail-named 'n\.tsx:1  black '
  flags named-arbitrary-gradient fail-named 'n\.tsx:2  blue '
  flags named-arbitrary-property fail-named 'n\.tsx:3  tomato '
  flags named-style-object fail-named "n\.tsx:4  backgroundColor: 'rebeccapurple "
  # Digits-only hex in a CSS value is a color, never text; an id selector is not a value.
  flags css-digit-hex-underline fail-css-digit-hex 'h\.css:1  #000000 '
  flags css-digit-hex-thin fail-css-digit-hex 'h\.css:2  #000000 '
  flags css-digit-hex-gradient-stop fail-css-digit-hex 'h\.css:3  #111111 '
  flags css-value-not-selector fail-css-value-not-selector '^1 problem'
  flags css-value-hex fail-css-value-not-selector 's\.css:1  #bed  #bed \{ color'
  flags regex-literal-hides-nothing fail-regex-hides-code 'r\.tsx:2  #abcdef '
  flags multiline-func fail-multiline-func 'm\.css:2  rgb\( '
  flags apostrophe-hides-nothing fail-apostrophe 'a\.tsx:1  #abc123 '
  flags percent-rgb fail-percent 'p\.css:1  rgb\( '
  flags percent-color fail-percent 'p\.css:2  color\( '
  flags percent-hsl fail-percent 'p\.css:3  hsl\( '
  flags markup-mid-line-slashes fail-markup-code 'v\.vue:2  #abcdef '
  # @theme inline outputs are not overridable tokens.
  STEP_REASON='src/index\.css:3  --color-card  is not defined in ui-base\.css' \
    step "token-check-flags-theme-inline-override" fail sh -c "cd app-fail-theme-inline && node '$check' src"
}

cd "$ROOT" || abort "cd-root" "cannot cd to $ROOT"
must "bundle-consistency" pass bundles_consistent
token_check_fixtures
cd "$ROOT" || abort "cd-root" "cannot cd to $ROOT"
must "validate-registry" pass "${SHADCN[@]}" registry validate "$REPO#$REF"
app vite
app next

[ $FAILED = 0 ]
