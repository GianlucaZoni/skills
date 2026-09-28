---
name: learn
description: Learn a topic, in a library of teaching workspaces.
disable-model-invocation: true
argument-hint: "What do you want to learn, or which topic to continue?"
---

This directory is a **library**. It holds no mission of its own: every subdirectory is a complete `/teach` workspace with its own `MISSION.md`, and one mission per workspace still holds.

What the library owns is the two documents at its root that no single workspace can see:

- `GLOSSARY.md` — the whole vocabulary, sectioned by workspace, every term citing where it was taught and where it gets used.
- `LEARNING-TREE.md` — what each workspace **spans**, and which concepts **bridge** between them.

Keeping those two true is the library's job, and it is the half of this skill that `/teach` cannot do.

Work the steps in order.

## 1. Locate the library

`LEARNING-TREE.md` marks the root. Walk up from the working directory until you find one, and treat that directory as the library for the rest of the session.

If nothing above you holds a `LEARNING-TREE.md`, this is not a library yet. Say so, and offer to found one here — `LEARNING-TREE.md`, `GLOSSARY.md`, `NOTES.md`, `AGENTS.md`, `AGENTS.md`, `assets/` — before going further.

## 2. Route

Read `LEARNING-TREE.md`, the root `NOTES.md`, and `GLOSSARY.md` first. `NOTES.md` carries how this learner wants to be taught across every topic; the workspace's own `NOTES.md` carries what is true only there.

Then branch on the argument:

**No argument** — report the library and stop for the user to pick. Lead with **drift**, because an inaccurate root document is worth more attention than a lesson: for each workspace, compare its lesson count against the highest lesson number cited in `GLOSSARY.md`, and name every gap you find. Then give each workspace its span summary and last-touched date, and recommend where to go next — a span sitting at `introduced` is a retrieval debt, and the workspace untouched longest is decaying fastest.

**Names an existing workspace** — continue it.

**Names something new** — interview for the mission and write `MISSION.md` before creating anything else, per `/teach`'s `MISSION-FORMAT.md`. Register the workspace in `LEARNING-TREE.md` the moment the mission is written: that is when it becomes a tenant. Every other file and directory arrives lazily, when a lesson first needs it.

**Names a near-miss** — `sveltekit` when `svelte/` exists is genuinely either a continuation or a new mission. Put both to the user and let them choose.

## 3. Teach

Read `/Users/gianlucazoni/.Codex/skills/teach/SKILL.md` and follow it, scoped to the chosen workspace. If that path is gone, glob for `teach/SKILL.md` under `~/.Codex` and report what you found before continuing.

`/teach` is the authority on lessons, resources, missions, learning records, and the zone of proximal development. The library changes exactly two things about it:

- **Assets are shared by default.** The design system lives in the library's root `assets/`, so lessons link `../../assets/lesson.css` and every workspace looks like one course. A workspace's own `assets/` holds only what will not generalise.
- **There is one glossary, at the root.** A workspace never gets its own; `/teach`'s `GLOSSARY-FORMAT.md` is superseded by [`GLOSSARY-FORMAT.md`](GLOSSARY-FORMAT.md) here.

## 4. Reconcile

A lesson is finished when both root documents reflect it. Hold this bar:

- Every term the lesson taught has an entry in `GLOSSARY.md`, under its workspace's section, and is `_Coined_` at that lesson.
- Every glossary term the lesson used has that lesson appended to its `_Seen_` list.
- The lesson's span row in `LEARNING-TREE.md` carries the state its evidence supports, and the workspace's last-touched date is today's.
- The generated section of `LEARNING-TREE.md` matches the filesystem.

Promoting a span to `solid` takes a learning record backing it. Without one, the span is `introduced`.

## Reference

- [`GLOSSARY-FORMAT.md`](GLOSSARY-FORMAT.md) — entry shape, citations, cross-topic collisions.
- [`LEARNING-TREE-FORMAT.md`](LEARNING-TREE-FORMAT.md) — the span ladder, bridges, and the generated section.
- `/teach`'s own siblings — `MISSION-FORMAT.md`, `RESOURCES-FORMAT.md`, `LEARNING-RECORD-FORMAT.md` — govern per-workspace documents unchanged.
