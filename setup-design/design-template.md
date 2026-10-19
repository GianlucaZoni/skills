# Design

This repo's settings for `/design`: what a Design branch may touch, and how its work is shown and handed to a dev. `/setup-design` wrote it, and it can be edited directly.

Design branches (`design/*`) never merge. A designer's request runs under `/design`, which only the designer can start: ask them to type it.

## Tokens

- **Token file**: `<path>`. <What lives where in it.>
- **Tokens doc**: `<path>`, listing every value with its source. When a value changes, both files change. A value a Design spec settled is cited as `#<spec number>` where a Figma node would go, until Figma catches up. Whoever updates Figma swaps the node in.
- **Figma**: file `<key>`.

## Dev server

- **Start**: `<command>`, run in the background. <Setup a fresh worktree needs first.>
- **URL**: `<pattern>`.
- **Widths**: desktop `<n>`, phone `<n>`. Measure at both, through the DOM.
- **Stills**: `<command>`.

## Variants

- **Folder**: `<path>/design-<topic>/`.
- **Switcher**: copy `<path>`, or the one in the `/design` skill's `VARIANTS.md`.
- **Prior art**: <past variant work in this repo worth reading first, if any.>

## Never changes

The backend, by path: whatever stores, serves or secures data.

- <path>: <what it is>

## Commits

- **Pre-commit**: <what the hook runs>. When it blocks a commit over a file in the variants folder, `git commit --no-verify` is acceptable on a `design/*` branch, because nothing on it merges.
- **Stills**: `design-screens/<topic>/`, kept out of deploys by <mechanism>.
