// Fails when a color is written outside the token file. Every color goes through the token file
// (src/index.css in a Vite app, app/globals.css in a Next app).
// Run from the project root: node scripts/check-tokens.mjs <dir> [dir...]   e.g. `src`, or `app components lib`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// Files allowed to hold color values, relative to the project root. The token files always are. Add content art
// that is a picture rather than UI (file previews, canvas drawings) here, one path per entry.
const ALLOWED = new Set(['src/index.css', 'app/globals.css'])

const dirs = process.argv.slice(2)
if (!dirs.length) {
  console.error('Usage: node scripts/check-tokens.mjs <dir> [dir...]   (e.g. src, or app components lib)')
  process.exit(2)
}
for (const d of dirs) {
  if (!existsSync(d) || !statSync(d).isDirectory()) {
    console.error(`check-tokens: ${d} is not a directory`)
    process.exit(2)
  }
}

const HEX = /#[0-9a-fA-F]{3,8}\b/g
const FUNC = /(?<![.\w-])(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color-mix|color)\(/g
// A named CSS color as a style value (`color: white`, `background: 'black'`, `bg-[red]`), not as a name in code
// (`variant="white"`, `tone: 'grey'`). `transparent` and `currentColor` are fine.
const NAMED = /(?:\b(?:[a-z-]*color|[a-z]*Color|background|border[a-zA-Z-]*|fill|stroke|outline|box-?[sS]hadow)\s*:\s*['"`]?|\b(?:fill|stroke|color|stop-?color|flood-?color|lighting-?color)\s*=\s*\{?\s*['"`]|\[)(?:white|black|red|blue|gray|grey|green|yellow|orange|purple|pink|silver|navy|teal|brown|maroon|lime|aqua|cyan|magenta|gold)(?=\s*[;!},'"`\]]|\s*$)/gi
// Tailwind's stock palette. The token file turns it off (--color-*: initial), so these would compile to nothing.
const PREFIX = 'bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|inset-ring|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow|inset-shadow|drop-shadow|text-shadow'
const HUE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|mauve|olive|mist|taupe'
const PALETTE = new RegExp(`(?<![\\w-])(?:${PREFIX})-(?:white|black|(?:${HUE})-\\d{2,3})(?![\\w-])`, 'g')

// Things that look like a hex color but aren't: SVG fragment ids (url(#goo)), hash routes (#/chats), template
// braces (#{...}), and text like "Order #4821".
const CSS_WORD = new Set(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden', 'px', 'em', 'rem', 'vh', 'vw', 'pt', 'ch', 'ex', 'fr', 'deg', 'ms', 's'])
const hexIsText = (line, m) => {
  const before = line.slice(0, m.index)
  const digits = /^#\d+$/.test(m[0])
  const len = m[0].length - 1
  if (/url\($/.test(before) || /^#[/{]/.test(line.slice(m.index, m.index + 2))) return true
  // Digits only: a color only when it has a color's length (3, 4, 6 or 8); else an id or a count.
  if (digits && ![3, 4, 6, 8].includes(len)) return true
  // Digits right after a plain text word and a space read as text: "Order #4821", "No. #12". Not after a CSS
  // keyword or a unit ('1px solid #222222', '0 1px 2px #000000'): the word must be letters only.
  const word = before.match(/(?:^|[^A-Za-z0-9_-])([A-Za-z]+\.?) $/)?.[1].replace(/\.$/, '').toLowerCase()
  if (digits && word && !CSS_WORD.has(word)) return true
  return false
}

const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(join(d, e.name)) : /\.(tsx?|css)$/.test(e.name) ? [join(d, e.name)] : [])

const hits = []
for (const file of dirs.flatMap(d => walk(d))) {
  const rel = relative(process.cwd(), file)
  if (ALLOWED.has(rel)) continue
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return
    const found = [
      ...[...line.matchAll(HEX)].filter(m => !hexIsText(line, m)),
      ...line.matchAll(FUNC),
      ...line.matchAll(NAMED),
      ...line.matchAll(PALETTE),
    ]
    for (const m of found) hits.push(`${rel}:${i + 1}  ${m[0].trim()}  ${line.trim().slice(0, 100)}`)
  })
}

if (hits.length) {
  console.error(`${hits.length} color literal(s) outside the token file. Use a token class (bg-card, text-foreground-3, border-border...) or add a token:\n`)
  console.error(hits.join('\n'))
  process.exit(1)
}
console.log(`tokens: no color literals outside the token file (checked ${dirs.join(', ')})`)
