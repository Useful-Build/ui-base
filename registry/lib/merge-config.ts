import type { ConfigExtension } from 'tailwind-merge'

// App-owned. List the class names of your own --app-* tokens here (text sizes, shadows, tracking, leading, radius,
// animate, container and spacing names, extra class groups) so cn() doesn't drop them next to a base class. Installed
// once, never updated.
export const appMergeConfig: ConfigExtension<string, string> = {
  extend: {
    theme: {},
    classGroups: {},
  },
}
