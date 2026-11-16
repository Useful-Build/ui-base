// Visual regression: every route in routes.ts, light and dark, compared with the baselines in visual.spec.ts-snapshots/.
// The first run writes the baselines. After a change that's meant to show, update them on purpose
// (npx playwright test -c playwright.ui.config.ts e2e/ui/visual.spec.ts --update-snapshots) so the image diff shows
// in the PR.
import { expect, test } from '@playwright/test'
import { ROUTES } from './routes'
import { openRoute, slug, THEMES } from './support'

for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`${theme} · ${route}`, async ({ page }) => {
      await openRoute(page, route, theme)
      await expect(page).toHaveScreenshot(`${theme}-${slug(route)}.png`, { fullPage: true })
    })
  }
}
