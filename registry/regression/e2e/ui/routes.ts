// The pages the UI suite checks, each in light and dark on desktop and phone. This file is the app's: ui-base
// installs it once and `regression-suite-update` leaves it alone. Add a route per screen, and one per open state
// worth guarding (a menu, a dialog) if the app can open it from the URL.
// UI_ROUTES (comma separated) replaces the list for one run.
export const ROUTES: string[] = process.env.UI_ROUTES ? process.env.UI_ROUTES.split(',') : ['/']
