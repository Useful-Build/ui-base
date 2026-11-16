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
// Case-insensitive, like CSS. Not after a letter, digit, dot or hyphen (toRgb(, x.color(, --color-mix(), but after a
// Tailwind _ (shadow-[0_0_0_1px_rgb(0_0_0)]).
const FUNC = /(?<![.A-Za-z0-9-])(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color-mix|color)\(/gi
// A color function is fine when it only mixes or derives from tokens, also in a Tailwind class where _ stands for a
// space:
// - color-mix(in oklab, var(--brand) 50%, transparent): tokens, transparent or currentColor, and percentage weights.
// - rgb(from var(--brand) r g b / 50%): a relative color from a token, with channel keywords.
// - rgb(var(--a) / var(--b)), or any other function whose every channel is a var(). A number or a percentage is
//   only allowed as the alpha after the slash. Anything else (a channel number, calc(), a named color) is a literal.
// Tokens hold hex values, so rgb(var(--brand) / 0.5) is invalid CSS: use bg-brand/50 or the color-mix above.
const COLOR_SPACES = new Set(['srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020', 'xyz',
  'xyz-d50', 'xyz-d65'])
const MIX_WORDS = new Set([...COLOR_SPACES, 'in', 'lab', 'oklab', 'lch', 'oklch', 'hsl', 'hwb', 'shorter', 'longer',
  'increasing', 'decreasing', 'hue', 'transparent', 'currentcolor'])
// A function's arguments, read up to its closing paren across at most 5 more lines, or null.
const funcArgs = (text, start) => {
  let depth = 0, lines = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')' && --depth === 0) return text.slice(text.indexOf('(', start) + 1, i)
    else if (text[i] === '\n' && ++lines > 5) return null
  }
  return null
}
// Channel keywords of a relative color whose source is a token: rgb(from var(--a) r g b / 50%).
const CHANNELS = new Set(['r', 'g', 'b', 'h', 's', 'l', 'c', 'w', 'a', 'x', 'y', 'z', 'alpha'])
// Stands in for each var(--x) (or var(--x, var(--y))) while the rest is checked. Empty var() is never valid CSS.
const VAR = 'var()'
const funcIsTokens = (text, m) => {
  const args = funcArgs(text, m.index)
  if (args === null) return false
  let rest = args
  for (let prev; prev !== rest;) {
    prev = rest
    rest = rest.replace(/var\(\s*--[\w-]+[\s_]*(?:,[\s_]*var\(\)[\s_]*)?\)/g, ` ${VAR} `)
  }
  const words = s => s.split(/[\s,_]+/).filter(Boolean)
  const name = m[0].slice(0, -1).toLowerCase()
  const percent = t => /^\d*\.?\d+%$/.test(t)
  if (name === 'color-mix') {
    return !rest.includes('/') && words(rest).every(t => t === VAR || percent(t) || MIX_WORDS.has(t.toLowerCase()))
  }
  const [main, alpha, ...extra] = rest.split('/')
  if (extra.length) return false
  const head = words(main)
  const relative = head[0]?.toLowerCase() === 'from'
  if (relative && head[1] !== VAR) return false
  let i = relative ? 2 : 0
  if (name === 'color' && !COLOR_SPACES.has(head[i++]?.toLowerCase())) return false
  const channel = t => t === VAR || (relative && CHANNELS.has(t.toLowerCase()))
  const channels = head.slice(i)
  if (!channels.length || !channels.every(channel)) return false
  if (alpha === undefined) return true
  const a = words(alpha)
  return a.length === 1 && (channel(a[0]) || /^\d*\.?\d+%?$/.test(a[0]) || a[0].toLowerCase() === 'none')
}

// Every CSS named color. transparent, currentColor and inherit are fine, so they're not here.
const NAMES = ('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
  'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
  'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred ' +
  'darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue ' +
  'dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray ' +
  'green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen ' +
  'lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink ' +
  'lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen ' +
  'linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue ' +
  'mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy ' +
  'oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip ' +
  'peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown ' +
  'seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle ' +
  'tomato turquoise violet wheat white whitesmoke yellow yellowgreen').split(' ')
const NAME_SET = new Set(NAMES)
const NAME_ALT = NAMES.join('|')
// A named color as a whole token in a CSS value or a Tailwind arbitrary value: `1px solid red`, `var(--a, red)`,
// `shadow-[0_1px_black]`, `bg-[linear-gradient(to_right,red,blue)]`. Not `.red`, `--red`, `red-500` or `state=red`.
const NAMED_TOKEN = new RegExp(`(?<=^|[\\s_,(:\\[/])(?:${NAME_ALT})(?=$|[\\s_,):\\];!/])`, 'gi')
// In JS and markup: a named color as a style value (`color: white`, `backgroundColor: 'black'`, fill="red"), not as a
// name in code (`variant="white"`, `tone: 'grey'`) or prose.
const NAMED = new RegExp(`(?:\\b(?:[a-z-]*color|[a-z]*Color|background|border[a-zA-Z-]*|fill|stroke|outline|box-?[sS]hadow)\\s*:\\s*['"\`]?|\\b(?:fill|stroke|color|stop-?color|flood-?color|lighting-?color)\\s*=\\s*\\{?\\s*['"\`])(?:${NAME_ALT})(?=\\s*[;!},'"\`\\]]|\\s*$)`, 'gim')
// A Tailwind arbitrary value (bg-[...]) or arbitrary property ([color:red]). Its content is checked as CSS.
const ARBITRARY = /-\[[^\]\s'"`]*\]|(?<![\w\]-])\[-{0,2}[a-z][\w-]*:[^\]\s'"`]*\]/g
// Tailwind's stock palette. The token file turns it off (--color-*: initial), so these would compile to nothing.
const PREFIX = 'bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|inset-ring|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow|inset-shadow|drop-shadow|text-shadow'
const HUE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|mauve|olive|mist|taupe'
const PALETTE = new RegExp(`(?<![\\w-])(?:${PREFIX})-(?:white|black|(?:${HUE})-\\d{2,3})(?![\\w-])`, 'g')

// Outside CSS values and class strings, digits that look like a hex color can be text: "Order #4821".
const CSS_WORD = new Set(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden',
  'thin', 'medium', 'thick', 'underline', 'overline', 'wavy', 'px', 'em', 'rem', 'vh', 'vw', 'pt', 'ch', 'ex', 'fr',
  'deg', 'ms', 's'])
const hexIsText = (before, hex) => {
  const digits = /^#\d+$/.test(hex)
  // Digits only: a color only when it has a color's length (3, 4, 6 or 8); else an id or a count.
  if (digits && ![3, 4, 6, 8].includes(hex.length - 1)) return true
  // Digits right after a plain text word and a space read as text: "Order #4821", "No. #12". Not after a CSS
  // keyword, a unit or a color ('1px solid #222222', 'thin #000000', 'red #111111'): the word must be letters only.
  const word = before.match(/(?:^|[^A-Za-z0-9_-])([A-Za-z]+\.?) $/)?.[1].replace(/\.$/, '').toLowerCase()
  return Boolean(digits && word && !CSS_WORD.has(word) && !NAME_SET.has(word))
}

const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(join(d, e.name)) : /\.(tsx?|jsx?|mjs|css|mdx|html|astro|vue|svelte)$/.test(e.name) ? [join(d, e.name)] : [])

// Blanks out comments and keeps everything else in place, so line and column numbers still match the file.
// mode: 'css' (block comments), 'js' (also // line comments and regex literals) or 'markup' (.vue, .svelte, .astro,
// .html, .mdx: also // line comments that start a line, as in their script blocks).
// Block comments are tracked across lines, several to a line. In JS, // starts a line comment except inside a string
// or right after a colon (https://...), and / starts a regex literal after one of ( , = : [ ! & | ? { } ; or at the
// start of a line, so a quote or /* inside it is ignored. Quoted strings are kept, since a color in a string is a
// literal. A ' or " right after a letter or digit is an apostrophe (JSX text: it's, Don't), not a string.
// Known limit: an apostrophe after a space or other punctuation ('n') in JSX text still opens a string to the end of
// the line, so a // note after it is checked as code. That fails loud, never quiet.
const stripComments = (text, mode) => {
  let out = '', i = 0, quote = null
  const blank = s => s.replace(/[^\n]/g, ' ')
  // The last non-space character before i on its line, or '' at the start of the line.
  const lastCode = () => {
    for (let j = out.length - 1; j >= 0; j--) {
      if (out[j] === '\n') return ''
      if (out[j] !== ' ' && out[j] !== '\t') return out[j]
    }
    return ''
  }
  // The end of a regex literal that opens at start: past its closing unescaped / outside a [...] class, on the same line.
  const regexEnd = start => {
    let cls = false
    for (let j = start + 1; j < text.length; j++) {
      const c = text[j]
      if (c === '\n') return -1
      if (c === '\\') j++
      else if (cls) cls = c !== ']'
      else if (c === '[') cls = true
      else if (c === '/') return j + 1
    }
    return -1
  }
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
    } else if (c === '/' && next === '/' &&
      ((mode === 'js' && text[i - 1] !== ':') || (mode === 'markup' && lastCode() === ''))) {
      const end = text.indexOf('\n', i)
      const stop = end === -1 ? text.length : end
      out += blank(text.slice(i, stop))
      i = stop
    } else if (mode === 'js' && c === '/' && next !== '>' && /^$|[(,=:[!&|?{};]/.test(lastCode()) && regexEnd(i) > 0) {
      const stop = regexEnd(i)
      out += text.slice(i, stop)
      i = stop
    } else {
      if (c === '`' || ((c === '"' || c === "'") && !/[A-Za-z0-9]/.test(text[i - 1] ?? ''))) quote = c
      out += c
      i++
    }
  }
  return out
}

// The declarations in css[from, to): each one's --name or property, where its value starts and ends, and the prelude
// of the block it sits in ('.dark', '@theme static'). Strings and parens are skipped, so a ; or { inside them is text.
const cssDecls = (css, from = 0, to = css.length) => {
  const found = [], stack = []
  let start = from, depth = 0, quote = null
  const declaration = end => {
    const seg = css.slice(start, end)
    const m = seg.match(/^\s*(--[\w-]+|-?[A-Za-z][\w-]*)\s*:/)
    if (m) {
      const at = start + seg.indexOf(m[1])
      found.push({ name: m[1], line: css.slice(0, at).split('\n').length, from: start + m[0].length, to: end,
        block: stack[stack.length - 1] })
    }
  }
  for (let i = from; i < to; i++) {
    const c = css[i]
    if (quote) { if (c === '\\') i++; else if (c === quote || c === '\n') quote = null }
    else if (c === '"' || c === "'") quote = c
    else if (c === '(') depth++
    else if (c === ')') depth = Math.max(0, depth - 1)
    else if (depth) continue
    else if (c === '{') { stack.push(css.slice(start, i).trim().replace(/\s+/g, ' ')); start = i + 1 }
    else if (c === '}') { declaration(i); stack.pop(); start = i + 1 }
    else if (c === ';') { declaration(i); start = i + 1 }
  }
  declaration(to)
  return found
}

// The --names the app CSS file sets in its :root and .dark blocks, with their line numbers.
const OVERRIDE_SELECTOR = /^(?::root|html)?(?:\.dark)?$/
const isOverrideBlock = b => b !== undefined && b.split(',').every(p => p.trim() && OVERRIDE_SELECTOR.test(p.trim()))
const overrides = css => cssDecls(css).filter(d => d.name.startsWith('--') && isOverrideBlock(d.block))
// The tokens ui-base.css lets an app override: its :root and .dark blocks and @theme static. Not what @theme inline
// derives from them (--color-card, --radius-lg): an override of those would cut the token out.
const definedIn = css => new Set(cssDecls(css)
  .filter(d => d.name.startsWith('--') && (isOverrideBlock(d.block) || d.block === '@theme static')).map(d => d.name))

const within = ranges => i => ranges.some(([a, b]) => i >= a && i < b)

// Every color literal in one file's comment-stripped text: [index, what].
const literals = (text, mode) => {
  const found = new Map()
  const add = (i, what) => { if (!found.has(i)) found.set(i, what) }
  // CSS: the whole file, or each <style> block of a markup file. Only declaration values are checked there, so an id
  // selector (#bed) is not a color.
  const regions = mode === 'css' ? [[0, text.length]] : mode === 'markup'
    ? [...text.matchAll(/(<style\b[^>]*>)([\s\S]*?)<\/style>/gi)].map(m => [m.index + m[1].length, m.index + m[1].length + m[2].length])
    : []
  const inCss = within(regions)
  const values = regions.flatMap(([a, b]) => cssDecls(text, a, b).map(d => [d.from, d.to]))
  const inValue = within(values)
  const arbitrary = [...text.matchAll(ARBITRARY)].map(m => {
    const open = m.index + m[0].indexOf('[')
    return [open + 1, m.index + m[0].length - 1]
  })
  const inArbitrary = within(arbitrary)
  const lineStart = i => text.lastIndexOf('\n', i - 1) + 1

  for (const m of text.matchAll(HEX)) {
    const before = text.slice(lineStart(m.index), m.index)
    if (/url\(\s*$/.test(before)) continue
    if (inArbitrary(m.index) || inValue(m.index)) add(m.index, m[0])
    else if (!inCss(m.index) && !hexIsText(before, m[0])) add(m.index, m[0])
  }
  for (const m of text.matchAll(FUNC)) if (!funcIsTokens(text, m)) add(m.index, m[0])
  // Named colors in CSS values and arbitrary values, with strings and url() blanked so a file name or a word in
  // content: "..." is not a color.
  const blank = s => s.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1|url\([^)]*\)/g, x => ' '.repeat(x.length))
  for (const [a, b] of [...values, ...arbitrary]) {
    for (const m of blank(text.slice(a, b)).matchAll(NAMED_TOKEN)) add(a + m.index, m[0])
  }
  for (const m of text.matchAll(NAMED)) if (!inCss(m.index)) add(m.index + m[0].length - m[0].match(/[A-Za-z]+$/)[0].length, m[0])
  for (const m of text.matchAll(PALETTE)) add(m.index, m[0])
  return [...found].sort((x, y) => x[0] - y[0])
}

const hits = []
for (const file of dirs.flatMap(d => walk(d))) {
  const rel = relative(process.cwd(), file)
  const mode = /\.(tsx?|jsx?|mjs)$/.test(file) ? 'js' : /\.css$/.test(file) ? 'css' : 'markup'
  const text = stripComments(readFileSync(file, 'utf8'), mode)
  if (APP_CSS.has(rel)) {
    const base = join(dirname(file), 'ui-base.css')
    if (!existsSync(base)) {
      console.error(`check-tokens: ${rel} has no ui-base.css next to it to check its overrides against`)
      process.exit(2)
    }
    const known = definedIn(stripComments(readFileSync(base, 'utf8'), 'css'))
    for (const o of overrides(text)) {
      if (!known.has(o.name) && !o.name.startsWith('--app-')) {
        hits.push(`${rel}:${o.line}  ${o.name}  is not defined in ui-base.css. Use a token it defines, or prefix an app-only token with --app-.`)
      }
    }
  }
  if (ALLOWED.has(rel)) continue
  const lines = text.split('\n')
  for (const [i, what] of literals(text, mode)) {
    const n = text.slice(0, i).split('\n').length
    hits.push(`${rel}:${n}  ${what.trim()}  ${lines[n - 1].trim().slice(0, 100)}`)
  }
}

if (hits.length) {
  console.error(`${hits.length} problem(s): a color literal outside the token files, or an override of a token ui-base.css doesn't define. Use a token class (bg-card, text-foreground-3, border-border...) or add a token:\n`)
  console.error(hits.join('\n'))
  process.exit(1)
}
console.log(`tokens: no color literals outside the token files (checked ${dirs.join(', ')})`)
