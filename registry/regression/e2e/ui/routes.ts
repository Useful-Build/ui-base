import type { Exclusion } from './support'

// The pages the UI suite checks, each in light and dark on desktop and phone. This file is the app's: ui-base
// installs it once and `regression-suite-update` leaves it alone. Add a route per screen, and one per open state
// worth guarding (a menu, a dialog) if the app can open it from the URL.
// UI_ROUTES (comma separated) replaces the list for one run.
export const ROUTES: string[] = process.env.UI_ROUTES ? process.env.UI_ROUTES.split(',') : ['/']

// The app's own known axe issues (from a library it uses, or waiting on a design call), added to the suite's. Keep
// each one as narrow as it can be, for example:
//   { rule: 'color-contrast', selector: '[data-chart]', why: 'chart labels sit on a picture' }
export const AXE_EXCLUDE: Exclusion[] = []

// Selectors masked in every screenshot: content that changes from run to run (a clock, a live feed, a random avatar).
export const MASKS: string[] = []
