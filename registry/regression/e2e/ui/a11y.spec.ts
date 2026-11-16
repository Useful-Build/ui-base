// Accessibility: axe (WCAG 2.1 A and AA) on every route in routes.ts, light and dark.
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import type { NodeResult, Result } from 'axe-core'
import * as routes from './routes'
import { openRoute, THEMES, type Exclusion } from './support'

// Known issues that come from a library or need a design call, here for every app and, from the app's routes.ts,
// AXE_EXCLUDE for its own (optional there). Each one skips a single rule; see Exclusion in support.ts. Keep each entry
// as narrow as it can be.
const app: { ROUTES: string[]; AXE_EXCLUDE?: Exclusion[] } = routes
const EXCLUDED: Exclusion[] = [
  // An open Radix Select sets aria-hidden on the rest of the page and traps focus in its list, so the hidden controls
  // can't be reached, but axe still counts them as focusable. Radix behaviour, and only while a select list is open.
  { rule: 'aria-hidden-focus', selector: '[data-aria-hidden]', when: '[data-slot="select-content"]', why: 'Radix hides the page while a select list is open' },
  // cmdk renders CommandSeparator (role=separator) inside its role=listbox, which axe doesn't allow there. Skipped only
  // when separators are the sole children axe objects to; a missing option or any other stray child still fails.
  { rule: 'aria-required-children', selector: '[cmdk-list]', related: '[role="separator"]', why: 'cmdk puts its separator inside the listbox' },
  ...(app.AXE_EXCLUDE ?? []),
]

// The nodes a failed check points at (for aria-required-children, the children that aren't allowed).
const relatedTargets = (n: NodeResult) =>
  [...n.any, ...n.all, ...n.none].flatMap(c => c.relatedNodes ?? []).map(r => String(r.target[0]))

async function remaining(page: Page, v: Result) {
  const rules: Exclusion[] = []
  for (const x of EXCLUDED.filter(x => x.rule === v.id)) {
    if (!x.when || await page.locator(x.when).count()) rules.push(x)
  }
  if (!rules.length) return v.nodes
  const keep = await Promise.all(v.nodes.map(n => page.evaluate(([target, related, rules]) => {
    const el = document.querySelector(target)
    if (!el) return true
    const relatedMatch = (sel: string | null) => !sel || (related.length > 0 && related.every(t => document.querySelector(t)?.matches(sel)))
    return !rules.some(r => el.closest(r.selector) && relatedMatch(r.related))
  }, [String(n.target[0]), relatedTargets(n), rules.map(x => ({ selector: x.selector, related: x.related ?? null }))] as const)))
  return v.nodes.filter((_, i) => keep[i])
}

for (const theme of THEMES) {
  for (const route of app.ROUTES) {
    test(`${theme} · ${route}`, async ({ page }) => {
      await openRoute(page, route, theme)
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      const found = (await Promise.all(violations.map(async v => ({ ...v, nodes: await remaining(page, v) })))).filter(v => v.nodes.length)
      const report = found.map(v => `${v.id} (${v.impact}): ${v.help}\n` +
        v.nodes.map(n => `  ${n.target.join(' ')}  ${n.failureSummary?.split('\n').slice(1, 2).join('')}\n    ${n.html.slice(0, 400)}`).join('\n'))
      expect(found, report.join('\n')).toEqual([])
    })
  }
}
