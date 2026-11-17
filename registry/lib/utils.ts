import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge, mergeConfigs } from 'tailwind-merge'
import { appMergeConfig } from './merge-config'

// Teach tailwind-merge our scales (the token file), or it reads text-md as a color and font-strong as a font family
// and drops the wrong class when two meet. Keep this in step with the token file's text, weight, shadow and
// tracking names. An app adds its own names in lib/merge-config.ts, merged after these.
const twMerge = extendTailwindMerge({
  // Our font sizes carry no line height, so a text-* size must not drop a leading-* next to it.
  override: {
    conflictingClassGroups: { 'font-size': [] },
  },
  extend: {
    theme: {
      text: ['2xs', 'md', 'display'],
      'font-weight': ['book', 'strong'],
      shadow: ['card', 'float', 'menu', 'window', 'halo'],
      tracking: ['title', 'label'],
    },
  },
}, (config) => mergeConfigs(config, appMergeConfig))

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
