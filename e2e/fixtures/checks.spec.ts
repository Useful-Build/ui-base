// E2E-only checks, copied into the app's e2e/ui/ for one run and removed after. They prove that the app CSS file's
// overrides win over ui-base.css and reach the components, and which font the app renders with.
//   EXPECT_PRIMARY_LIGHT, EXPECT_PRIMARY_DARK, EXPECT_BRAND_LIGHT, EXPECT_BRAND_DARK   hex values set in the app CSS file
//   EXPECT_FONT       a regex the body's computed font-family must match
//   EXPECT_NOT_FONT   a regex it must not match (optional)
import { expect, test } from '@playwright/test'
import { openRoute } from './support'

const env = (name: string) => {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}
const rgb = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

for (const theme of ['light', 'dark'] as const) {
  test(`overrides win in ${theme}`, async ({ page }) => {
    const primary = env(`EXPECT_PRIMARY_${theme.toUpperCase()}`).toLowerCase()
    const brand = env(`EXPECT_BRAND_${theme.toUpperCase()}`).toLowerCase()
    await openRoute(page, '/', theme)
    const got = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement)
      const button = document.querySelector('[data-slot="button"][data-variant="default"]:not(:disabled)')
      return {
        primary: root.getPropertyValue('--primary').trim().toLowerCase(),
        brand: root.getPropertyValue('--brand').trim().toLowerCase(),
        buttonBg: button ? getComputedStyle(button).backgroundColor : null,
      }
    })
    expect(got.primary).toBe(primary)
    expect(got.brand).toBe(brand)
    // The override reaches a component's paint, not only the custom property.
    expect(got.buttonBg).toBe(rgb(primary))
  })
}

test('font', async ({ page }) => {
  await openRoute(page, '/', 'light')
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  expect(family).toMatch(new RegExp(env('EXPECT_FONT')))
  if (process.env.EXPECT_NOT_FONT) expect(family).not.toMatch(new RegExp(process.env.EXPECT_NOT_FONT))
})
