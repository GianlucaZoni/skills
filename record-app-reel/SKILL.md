---
name: record-app-reel
description: Record a web app as a screen-recorded take — study the app, write a storyboard, drive it in a headless browser with a visible eased cursor, encode 1080p footage plus per-scene clips. Use when asked for a demo, walkthrough, or case-study video of an app, or to re-record one after a UI change.
---

# Recording an app reel

A **take** is one unbroken session, filmed continuously; **scenes** are named stretches of
it, cut out afterwards as clips. You author the storyboard; a runner replays it. Silent
footage — no titles, captions, or audio.

The runner is written and bundled. Your work is the storyboard, and the storyboard is only
as good as what you learned about the app first.

## 1. Install the runner

Copy `assets/runner/` into the project as `scripts/record/` (or wherever project-internal
tooling lives — prefer a path already excluded from any client/delivery bundle), then
`cd` there and install. It carries its own `package.json` on purpose: the host repo's
manifest stays clean and nothing dangles for whoever receives that bundle.

Requires `ffmpeg` on PATH. Say so and stop if it is missing.

Done when `yarn install` (or npm) completes and `npx playwright install chromium` has run.

## 2. Learn what there is to film

Read the app: routes, navigation chrome, the interaction surface of each view (filters,
selects, hover targets), how auth works, and what data it needs to look alive.

Two things to write down as you go:

- **What is not filmable.** A download that is a Blob plus a synthetic click, a copy-to-
  clipboard, a toast that never fires locally — these read as nothing on camera. Naming
  them now stops a scene being written around one.
- **What the app needs to be worth filming.** Empty states make dull footage. Find the
  seed, fixture, or tenant that fills the screen.

Done when you can name every route, its interaction surface, and the auth path, and have
listed what cannot be filmed.

## 3. Propose the scene table

Write the tour as a table: scene name, the beats in it, rough seconds. Order it as a
visit, not a feature list — a person arriving, looking, drilling in, leaving. Signing out
at the end is a cheap, clean bookend.

Put it to the user and wait.

Done when the user has approved a table naming every scene, its beats, and its duration.
Not before: this is the decision the whole recording rests on, and it is far cheaper to
argue about a table than about footage.

## 4. Write the storyboard

Read [`BEATS.md`](BEATS.md) first — the beat vocabulary, the targeting rules, and the
traps that produce footage that looks fine in the log and empty on screen.

Write `project.ts` from `project.example.ts` (build and serve commands, viewport, subjects,
any auth stub), then `storyboard.ts` as scenes of beats.

Prefer stubbing auth over signing in for real: intercept the login request and answer with
local fixture data, reusing whatever the app's own server uses to build that response, so
the shape stays honest and breaks loudly if it changes.

Done when `tsc --noEmit` is clean and every scene in the approved table exists.

## 5. Record, then look at the footage

Run it. Beats throw on missing targets, so failures are loud — fix and re-run.

Then **look at the frames**, which is a separate act from the run succeeding: extract the
midpoint of every scene into a contact sheet and read it.

```bash
FR=$(node -e "const s=require('./recordings/<subject>/scenes.json');console.log(s.map(x=>'eq(n\\,'+Math.round((x.startMs+x.endMs)/2/1000*30)+')').join('+'))")
ffmpeg -i recordings/<subject>/take.mp4 -vf "select='$FR',scale=630:-1,tile=3x3" -frames:v 1 -y sheet.png
```

A green run proves the beats executed; only the sheet proves the take shows what the table
promised. Check each tile against its scene name — a mismatch between the two means the
frame clock and the boundary clock have drifted apart, and every clip is cut in the wrong
place.

Done when every scene in the sheet shows what its row of the table said it would.

## 6. Hand over

Report duration, scene count, and where the files are. Send the take. Say plainly what you
left out and why — the unfilmable list from step 2 is part of the deliverable.
