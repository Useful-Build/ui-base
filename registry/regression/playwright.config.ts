import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// The UI regression suite (e2e/ui): every route in e2e/ui/routes.ts, light and dark, on desktop and phone.
// It runs against a production build. Override with env:
//   UI_PORT        port for the built app (default 4173)
//   UI_BASE_URL    test an app that's already running somewhere else (then no server is started)
//   UI_WEB_COMMAND the command that builds and serves the app (default: Next or Vite, detected)
//   UI_OUT_DIR     where results and the HTML report go (default test-results/ui)
const port = Number(process.env.UI_PORT ?? 4173)
const isNext = ['next.config.ts', 'next.config.mjs', 'next.config.js'].some(f => existsSync(f))
const command = process.env.UI_WEB_COMMAND ?? (isNext
  ? `npm run build && npx next start --port ${port}`
  : `npm run build && npx vite preview --port ${port} --strictPort`)
const out = process.env.UI_OUT_DIR ?? 'test-results/ui'

export default defineConfig({
  testDir: './e2e/ui',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  outputDir: `${out}/results`,
  reporter: [['list'], ['html', { outputFolder: `${out}/report`, open: 'never' }]],
  use: {
    baseURL: process.env.UI_BASE_URL ?? `http://localhost:${port}`,
    screenshot: 'only-on-failure',
  },
  // A shot fails past 100 changed pixels, a fixed count, so one missing icon fails even on a tall full-page shot.
  expect: { toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixels: 100 } },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: false } },
  ],
  webServer: process.env.UI_BASE_URL ? undefined : {
    command,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
})
