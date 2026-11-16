# Changelog

Read the entry for a release before you run `update`, `update-next` or `regression-suite-update`. Each entry lists:

- **Icon names:** names added to `components/ui/icon-names.ts`. Map each one in your `components/ui/icon.tsx`; the type check fails until you do.
- **Tokens:** tokens added, and tokens deprecated in favor of a new name.
- **App-owned files to touch:** anything in the app CSS file, `icon.tsx`, `scripts/check-tokens.allow.json` or `e2e/ui/routes.ts` the app must change by hand, since updates never ship those files.

Rules every release follows:

- **Tokens are never renamed outright.** A release adds the new name and keeps the old one in `ui-base.css` as an alias (`--old: var(--new);`) for at least one release, listed here as deprecated. An app's overrides of the old name keep working until it moves over, and `lint:tokens` flags an override once the old name is gone.
- **The app CSS starter is frozen.** Every app owns its copy of `src/index.css` or `app/globals.css`, so a release never changes the starter. Anything new (a token, a base style, a helper) ships in `ui-base.css`.
- **App-owned files never ship in an update item.** Anything an app is told to edit is installed once by `base`, `base-next` or `regression-suite`.

## v1.0.0 (2026-11-16)

First release.

- **Icon names:** `check`, `chevron_right`, `close`, `expand_less`, `expand_more`, `search`, `unfold_more`.
- **Tokens:** the full role token set in `ui-base.css`, light and dark. See `DESIGN_SYSTEM.md`.
- **App-owned files to touch:** none.
