// Shared helpers for the UI suite. Owned by ui-base: `regression-suite-update` rewrites this file.
import { expect, type Page } from '@playwright/test'

export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

// An axe rule skipped on nodes inside `selector` (el.closest(selector)), only while the `when` element is on the page
// if it names one, and only when every node axe blames for it matches `related` if it names one. The rule still runs
// everywhere else. `why` says where the issue comes from.
export type Exclusion = { rule: string; selector: string; why: string; when?: string; related?: string }

// '/' -> home, '/settings?tab=team' -> settings-tab-team
export const slug = (route: string) => route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'

// Both theme providers (the Vite template's and next-themes) default to the system theme, so the color scheme
// picks light or dark. Reduced motion makes enter animations finish at once.
export async function openRoute(page: Page, route: string, theme: Theme) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
  await page.goto(route)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`))
  await page.evaluate(() => document.fonts.ready)
}
