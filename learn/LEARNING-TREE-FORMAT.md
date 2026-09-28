# LEARNING-TREE.md Format

`LEARNING-TREE.md` is the library's map, and its presence at the root is what marks a directory as a library. It answers two questions no single workspace can: how far each workspace **spans**, and which concepts **bridge** between them.

## Structure

```md
# Learning Tree

## Workspaces

### svelte
_Mission_: Understand Svelte as an abstraction — its tradeoffs, motion craft, and shipping on SvelteKit.
_Last touched_: 2026-08-25 · _Lessons_: 1

| Span | State | Evidence |
| --- | --- | --- |
| Runes and the reactivity model | introduced | [lesson 0001](svelte/lessons/0001-the-body-runs-once.html) |
| Transitions and motion primitives | untouched | — |
| SvelteKit routing and load | untouched | — |

## Bridges

- **Closures** (javascript) → **signal capture** (svelte): reading a value inside a tracked scope is the same mechanism both rely on, which is why the compiler output is legible rather than magic.

## Structure

<!-- BEGIN GENERATED -->
<!-- END GENERATED -->
```

## The span ladder

Four states, each with a test that can be checked rather than felt:

- **`untouched`** — named as in-scope by the mission, never taught.
- **`introduced`** — taught at least once. Fluency only: the user could follow it in the moment, and nothing yet shows it stuck.
- **`solid`** — a learning record in that workspace backs it. The record is the evidence; without one the span stays `introduced` however well the lesson went.
- **`applied`** — used in real work outside the lessons.

Tying `solid` to a learning record is what keeps the ladder honest: a span cannot be promoted by optimism, only by a file. It also mirrors `/teach`'s split between fluency strength and storage strength — `introduced` is fluency, `solid` is storage.

A `span` is a chunk of the mission's territory, sized so its state is meaningful — roughly what one lesson could carry to `introduced`. Derive the initial spans from the workspace's `MISSION.md`, including the ones still `untouched`: the gaps are what make the table answer "what next?".

## Workspace metadata

- **`_Last touched_`** is the date of the most recent lesson. Recorded from the first day so cross-topic scheduling stays possible later; it cannot be backfilled.
- **`_Lessons_`** is the count in `<workspace>/lessons/`. Reading it against `GLOSSARY.md` citations is how drift becomes visible.
- **`_Dormant_`** marks a workspace deliberately parked. It is a state, not a move: the files stay exactly where they are, and the workspace keeps its section.

## Bridges

A bridge is a concept learned in one workspace that carries into another. Write one when the carry is real and specific enough to name both ends and say what transfers — a vague adjacency is noise.

Bridges are hand-written judgement, never derived. When the library holds one workspace there are none, and the section should say so plainly rather than reach for a connection.

## The generated section

Everything between the markers is regenerated, never hand-edited. Run this at the library root:

```bash
find . -path ./.git -prune -o -name .DS_Store -prune -o -print | sort | sed 's|[^/]*/|  |g'
```

Then replace everything between the two markers with its output, in a fenced block. Edit the file directly rather than scripting the substitution: the tree is multi-line, and piping it through `awk -v` or `sed` fails on BSD tools.

Regenerate whenever a file is added, so the map never claims a shape the filesystem does not have. A hand-maintained mirror of a directory tree goes stale on the first new lesson, and a stale map is worse than none.
