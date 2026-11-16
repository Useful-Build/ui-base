// Fails when a color is written outside the token files. Every color goes through ui-base.css or the app CSS file
// that imports it and overrides tokens (src/index.css in a Vite app, app/globals.css in a Next app).
// It also fails when the app CSS file's :root or .dark blocks set a --name that ui-base.css doesn't define (a renamed
// or mistyped token would otherwise do nothing). App-only tokens start with --app- and are always fine.
// Run from the project root: node scripts/check-tokens.mjs <dir> [dir...]   e.g. `src`, or `app components lib`.
// Owned by ui-base: `add update` rewrites this file, so don't edit it. To allow content art that is a picture rather
// than UI (file previews, canvas drawings), list its path, relative to the project root, in the app's own
// scripts/check-tokens.allow.json (a JSON array of paths), which updates leave alone.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

// The app CSS file, wherever the framework puts it. With ui-base.css, the only files allowed to hold color values.
const APP_CSS = new Set(['src/index.css', 'app/globals.css', 'src/app/globals.css'])
const BUILT_IN = [...APP_CSS, 'src/ui-base.css', 'app/ui-base.css', 'src/app/ui-base.css']

const ALLOW_FILE = join(dirname(fileURLToPath(import.meta.url)), 'check-tokens.allow.json')
const appAllowed = () => {
  if (!existsSync(ALLOW_FILE)) return []
  let list
  try {
    list = JSON.parse(readFileSync(ALLOW_FILE, 'utf8'))
  } catch (e) {
    console.error(`check-tokens: ${relative(process.cwd(), ALLOW_FILE)} is not valid JSON: ${e.message}`)
    process.exit(2)
  }
  if (!Array.isArray(list) || !list.every(p => typeof p === 'string')) {
    console.error(`check-tokens: ${relative(process.cwd(), ALLOW_FILE)} must be a JSON array of paths`)
    process.exit(2)
  }
  return list
}
const ALLOWED = new Set([...BUILT_IN, ...appAllowed()])

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
// A color function is fine when it only mixes or wraps tokens: rgb(var(--x) / 50%), rgb(var(--x) / 0.5),
// color-mix(in oklab, var(--a) 40%, var(--b)), a relative color from a token (rgb(from var(--a) r g b / 50%)), also in
// a Tailwind class where _ stands for a space. Anything else in it (a channel number, a named color) is a literal.
const FUNC_KEYWORDS = new Set(['in', 'srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020', 'lab',
  'oklab', 'lch', 'oklch', 'hsl', 'hwb', 'xyz', 'xyz-d50', 'xyz-d65', 'shorter', 'longer', 'increasing', 'decreasing',
  'hue', 'transparent', 'currentcolor'])
const funcArgs = (line, start) => {
  let depth = 0
  for (let i = start; i < line.length; i++) {
    if (line[i] === '(') depth++
    else if (line[i] === ')' && --depth === 0) return line.slice(line.indexOf('(', start) + 1, i)
  }
  return null
}
// Channel keywords of a relative color whose source is a token: rgb(from var(--a) r g b / 50%).
const CHANNELS = new Set(['r', 'g', 'b', 'h', 's', 'l', 'c', 'w', 'a', 'x', 'y', 'z', 'alpha'])
const VAR = '\u0000'
const funcIsTokens = (line, m) => {
  const args = funcArgs(line, m.index)
  if (args === null || !/var\(/.test(args)) return false
  let rest = args
  for (let prev; prev !== rest;) { prev = rest; rest = rest.replace(/var\(\s*--[\w-]+\s*\)/g, ` ${VAR} `) }
  const words = s => s.split(/[\s,_]+/).filter(Boolean)
  const [main, alpha, ...extra] = rest.split('/')
  if (extra.length) return false
  const head = words(main)
  const relativeColor = head[0]?.toLowerCase() === 'from'
  if (relativeColor && head[1] !== VAR) return false
  const isChannel = t => relativeColor && CHANNELS.has(t.toLowerCase())
  const mainOk = head.every((t, i) => t === VAR || (relativeColor && i === 0) || isChannel(t) ||
    FUNC_KEYWORDS.has(t.toLowerCase()) || /^\d*\.?\d+%$/.test(t))
  // After the slash, the alpha: a token, a number or a percentage (rgb(var(--a) / 0.5)).
  const alphaOk = alpha === undefined || words(alpha).every(t => t === VAR || isChannel(t) || /^\d*\.?\d+%?$/.test(t))
  return mainOk && alphaOk
}
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
  e.isDirectory() ? walk(join(d, e.name)) : /\.(tsx?|jsx?|mjs|css|mdx|html|astro|vue|svelte)$/.test(e.name) ? [join(d, e.name)] : [])

// Blanks out comments and keeps everything else in place, so line and column numbers still match the file.
// Block comments are tracked across lines, several to a line. In JS-like files, // starts a line comment, except
// inside a string or right after a colon (https://...). Quoted strings are kept, since a color in a string is a literal.
const stripComments = (text, js) => {
  let out = '', i = 0, quote = null
  const blank = s => s.replace(/[^\n]/g, ' ')
  while (i < text.length) {
    const c = text[i], next = text[i + 1]
    if (quote) {
      out += c
      if (c === '\\') { out += next ?? ''; i += 2; continue }
      if (c === quote || (c === '\n' && quote !== '`')) quote = null
      i++
    } else if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2)
      const stop = end === -1 ? text.length : end + 2
      out += blank(text.slice(i, stop))
      i = stop
    } else if (js && c === '/' && next === '/' && text[i - 1] !== ':') {
      const end = text.indexOf('\n', i)
      const stop = end === -1 ? text.length : end
      out += blank(text.slice(i, stop))
      i = stop
    } else {
      if (c === '"' || c === "'" || c === '`') quote = c
      out += c
      i++
    }
  }
  return out
}

// The --names the app CSS file sets in its :root and .dark blocks, with their line numbers.
const OVERRIDE_SELECTOR = /^(?::root|html)?(?:\.dark)?$/
const overrides = css => {
  const found = [], stack = []
  let start = 0
  const declaration = end => {
    const decl = css.slice(start, end)
    const m = decl.match(/^\s*(--[\w-]+)\s*:/)
    const selector = stack[stack.length - 1]
    if (m && selector !== undefined && selector.split(',').every(p => p.trim() && OVERRIDE_SELECTOR.test(p.trim()))) {
      const at = start + decl.indexOf(m[1])
      found.push({ name: m[1], line: css.slice(0, at).split('\n').length })
    }
  }
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') { stack.push(css.slice(start, i).trim()); start = i + 1 }
    else if (css[i] === '}') { declaration(i); stack.pop(); start = i + 1 }
    else if (css[i] === ';') { declaration(i); start = i + 1 }
  }
  return found
}
const definedIn = css => new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]))

const hits = []
for (const file of dirs.flatMap(d => walk(d))) {
  const rel = relative(process.cwd(), file)
  const js = /\.(tsx?|jsx?|mjs)$/.test(file)
  const text = stripComments(readFileSync(file, 'utf8'), js)
  if (APP_CSS.has(rel)) {
    const base = join(dirname(file), 'ui-base.css')
    if (!existsSync(base)) {
      console.error(`check-tokens: ${rel} has no ui-base.css next to it to check its overrides against`)
      process.exit(2)
    }
    const known = definedIn(stripComments(readFileSync(base, 'utf8'), false))
    for (const o of overrides(text)) {
      if (!known.has(o.name) && !o.name.startsWith('--app-')) {
        hits.push(`${rel}:${o.line}  ${o.name}  is not defined in ui-base.css. Use a token it defines, or prefix an app-only token with --app-.`)
      }
    }
  }
  if (ALLOWED.has(rel)) continue
  text.split('\n').forEach((line, i) => {
    const found = [
      ...[...line.matchAll(HEX)].filter(m => !hexIsText(line, m)),
      ...[...line.matchAll(FUNC)].filter(m => !funcIsTokens(line, m)),
      ...line.matchAll(NAMED),
      ...line.matchAll(PALETTE),
    ]
    for (const m of found) hits.push(`${rel}:${i + 1}  ${m[0].trim()}  ${line.trim().slice(0, 100)}`)
  })
}

if (hits.length) {
  console.error(`${hits.length} problem(s): a color literal outside the token files, or an override of a token ui-base.css doesn't define. Use a token class (bg-card, text-foreground-3, border-border...) or add a token:\n`)
  console.error(hits.join('\n'))
  process.exit(1)
}
console.log(`tokens: no color literals outside the token files (checked ${dirs.join(', ')})`)
