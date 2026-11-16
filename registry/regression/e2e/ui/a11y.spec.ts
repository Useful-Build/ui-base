// Accessibility: axe (WCAG 2.1 A and AA) on every route in routes.ts, light and dark.
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import type { Result } from 'axe-core'
import { openRoute, ROUTES, THEMES } from './routes'

// Known issues that come from a library or need a design call. Each one skips a single rule on nodes inside its
// selector (el.closest(selector)), only while the `when` element is on the page if it names one; the rule still runs
// everywhere else. Keep each entry as narrow as it can be.
const EXCLUDED: { rule: string; selector: string; why: string; when?: string }[] = [
  // An open Radix Select sets aria-hidden on the rest of the page and traps focus in its list, so the hidden controls
  // can't be reached, but axe still counts them as focusable. Radix behaviour, and only while a select list is open.
  { rule: 'aria-hidden-focus', selector: '[data-aria-hidden]', when: '[data-slot="select-content"]', why: 'Radix hides the page while a select list is open' },
  // cmdk renders CommandSeparator (role=separator) inside its role=listbox, which axe doesn't allow there.
  { rule: 'aria-required-children', selector: '[cmdk-list]', why: 'cmdk puts its separator inside the listbox' },
]

async function remaining(page: Page, v: Result) {
  const rules: typeof EXCLUDED = []
  for (const x of EXCLUDED.filter(x => x.rule === v.id)) {
    if (!x.when || await page.locator(x.when).count()) rules.push(x)
  }
  if (!rules.length) return v.nodes
  const keep = await Promise.all(v.nodes.map(n => page.evaluate(([target, selectors]) => {
    const el = document.querySelector(target)
    return !el || !selectors.some(sel => el.closest(sel))
  }, [String(n.target[0]), rules.map(x => x.selector)] as const)))
  return v.nodes.filter((_, i) => keep[i])
}

for (const theme of THEMES) {
  for (const route of ROUTES) {
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
