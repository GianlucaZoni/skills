# GLOSSARY.md Format

The library's `GLOSSARY.md` is the canonical language across every workspace. Lessons, reference documents, and learning records all adhere to it. Building it is itself part of learning: compressing a concept into a tight definition is evidence of understanding it.

This is the library's only glossary. It supersedes `/teach`'s `GLOSSARY-FORMAT.md`, which describes a per-workspace file the library does not use.

## Structure

Sections are workspace names, matching directory names exactly, so a section maps to a workspace with no lookup.

```md
# Glossary

The vocabulary of everything learned in this library, sectioned by workspace.

## svelte

**Rune**:
A `$`-prefixed primitive the compiler recognises as a declaration of reactivity.
_Avoid_: Hook, magic variable, decorator
_Coined_: [lesson 0001](svelte/lessons/0001-the-body-runs-once.html)
_Seen_: [rosetta](svelte/reference/react-to-svelte-rosetta.html)

**Derived value**:
A value the runtime recomputes when a rune it read during evaluation changes.
_Avoid_: Computed, memo, reactive statement
_Coined_: [lesson 0001](svelte/lessons/0001-the-body-runs-once.html)

## Collisions

**Signal**:
- _svelte_: the runtime unit of reactivity a rune creates — a value that records who read it.
- _dsp_: a measured quantity varying over time, the thing a filter transforms.
```

## Citations

Two fields, answering two different questions. Both link relative to the library root, so they resolve from `GLOSSARY.md` itself.

- **`_Coined_`** is where the term was taught. Exactly one lesson, and it never changes: it is the pointer for "go re-read the explanation."
- **`_Seen_`** is where the term gets used afterwards — later lessons, reference documents, learning records. Appended as they are written, and the answer to "where does this actually earn its keep." Omit the field until there is a second appearance.

Cite files, never `#anchor`s: anchors demand stable per-term anchors in every lesson forever, and they rot silently the first time a lesson is edited.

**Append `_Seen_` by hand, while writing the lesson that uses the term.** Meaningful use is not a string match — words like _state_ and _effect_ appear as strings in nearly every file here, so a generated index would be noise.

## Rules

- **Add a term only when the user understands it.** The glossary records compressed knowledge; it is not a dictionary read in order to learn. Wait until the term can be used correctly before promoting it.
- **Be opinionated.** When several words name one concept, pick the best and list the rest under `_Avoid_`. This is how language compresses.
- **Keep definitions to one or two sentences.** Define what the term IS, not how to do it.
- **Prefer the glossary's own terms inside definitions.** Once a term is here, use it everywhere, including in other definitions. That is what makes later terms cheap to grasp.
- **Send genuine cross-topic clashes to `## Collisions`.** When one word means different things in two workspaces, one entry holds both readings, each labelled with its workspace. These entries are the highest-value content in the file: they are the only thing a library can see that a single workspace cannot.
- **Revise in place as understanding deepens.** A week-one definition may be wrong by week six. Update it; a stale entry teaches the wrong thing every time it is read.
