// Accessibility: axe (WCAG 2.1 A and AA) on every route in routes.ts, light and dark.
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import type { Result } from 'axe-core'
import { openRoute, ROUTES, THEMES } from './routes'

// Known issues that need a design call or come from a library. Each one skips a single rule on nodes inside its
// selector (el.closest(selector)), on every route or only on the routes it names; the rule still runs everywhere else.
const EXCLUDED: { rule: string; selector: string; why: string; routes?: string[] }[] = []

async function remaining(page: Page, route: string, v: Result) {
  const rules = EXCLUDED.filter(x => x.rule === v.id && (!x.routes || x.routes.includes(route)))
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
      const found = (await Promise.all(violations.map(async v => ({ ...v, nodes: await remaining(page, route, v) })))).filter(v => v.nodes.length)
      const report = found.map(v => `${v.id} (${v.impact}): ${v.help}\n` +
        v.nodes.map(n => `  ${n.target.join(' ')}  ${n.failureSummary?.split('\n').slice(1, 2).join('')}\n    ${n.html.slice(0, 400)}`).join('\n'))
      expect(found, report.join('\n')).toEqual([])
    })
  }
}
