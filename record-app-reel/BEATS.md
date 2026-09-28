# Beats, targets, and the traps

Reference for writing `storyboard.ts`. The vocabulary lives in `beats.ts`; this is how to
use it and what goes wrong.

## The vocabulary

| Beat | What it does |
|---|---|
| `moveToTarget(t)` | travel only |
| `click(t, {after})` | travel, dwell, press, dwell |
| `hover(t, {hold, tooltip})` | park and hold; `tooltip: true` fails if none appears |
| `type(text, {into})` | click into a field, then per-character jitter |
| `nav(label)` | a navigation link by its visible name |
| `choose(ariaLabel, item)` | open a select/combobox, pick the option by text |
| `chooseNth(ariaLabel, i)` | same, by position — for lists that differ per subject |
| `sidebar(label, 'open' \| 'closed')` | state-aware panel toggle |
| `settle({selector, networkQuietMs, budgetMs})` | wait for the app to be ready |
| `pause(ms)` | hold |
| `raw(label, fn)` | escape hatch: the raw `page` |

Targets are a selector string, a `{x, y}` point, `within(selector, fx, fy)` for a
fractional position inside an element, or `largest(selector, rank)`.

## Targeting

**`largest()` over `nth=`.** Positional indices rot: filters applied in an early scene
change how many bubbles, cells or ribbons exist later, so `nth=6` can be valid for one
subject and absent for the next. The biggest element is also usually the shot worth
taking.

**Charts hide their hit targets.** The visible mark is often `pointer-events: none` with a
transparent corridor painted above it, and the accessible node can sit on a wrapping div
outside the `<svg>`. Read the component before guessing a selector, and prefer whatever
carries `role` and `aria-label`.

**Assert the tooltip.** `hover(t, {tooltip: true})` turns "nothing appeared" into a failed
run. Without it, a hover over dead space logs green and films an empty pause.

## Dwell and pace

`pace` multiplies every dwell and hold — one number for the whole take. Dwell is what
reads as human: stillness before acting, stillness after the result lands. Perfectly eased
motion without pauses still looks robotic.

## Settling

Chart entry animations expose no completion event, so `budgetMs` — a fixed hold — is the
honest tool. Network-bound content (map tiles) has unbounded latency and needs
`networkQuietMs` before the budget starts. Do not instrument the app with readiness hooks
for a video.

## Traps

**State-aware, not toggling.** Panels that start open make a blind toggle film the exact
opposite of the intended shot. State the state you want.

**Off-canvas elements still report a box.** A collapsed panel resolves to a real
`boundingBox` at negative coordinates; `centerOf` rejects points outside the viewport for
exactly this reason. Trust the throw — it means the panel needs opening first.

**`page.evaluate` with an inline function breaks under tsx.** esbuild's `keepNames`
injects a `__name` helper that does not exist in the page: `ReferenceError: __name is not
defined`. Pass a string expression instead.

**Full Chromium, not the headless shell.** WebGL content (maps, 3D) needs
`channel: 'chromium'`, which is already pinned. Headless is not load-bearing either way —
capture goes through CDP, not an OS screen grab, so `--headed` gives byte-identical
output. If headless fights you, run headed.

**One clock.** Frames are stamped on arrival with Node's clock, the same one that stamps
scene boundaries. CDP's `metadata.timestamp` runs on the browser's own base; trusting it
skews the take against `scenes.json`, and the only symptom is a contact sheet whose tiles
show the wrong scenes.
