// E2E-only check, copied into the app's e2e/ui/ for one run and removed after. It proves cn() reads the app's own
// lib/merge-config.ts: the app registered a theme text size called hero, so hero must not be read as a color.
//   UTILS_PATH   the app's lib/utils.ts, relative to the app root
import path from 'node:path'
import { expect, test } from '@playwright/test'

test('cn() keeps the app-registered text size apart from colors and other sizes', async () => {
  const rel = process.env.UTILS_PATH
  if (!rel) throw new Error('UTILS_PATH is not set')
  const { cn } = await import(path.resolve(process.cwd(), rel))
  // hero is a size, so a color next to it stays. If cn() ignored the config, hero would read as a color and drop it.
  expect(cn('text-foreground', 'text-hero')).toBe('text-foreground text-hero')
  // hero and another size conflict, the later one wins. If cn() ignored the config, both would stay.
  expect(cn('text-md', 'text-hero')).toBe('text-hero')
  // The base's own scales still work next to it.
  expect(cn('text-md', 'text-display')).toBe('text-display')
})
