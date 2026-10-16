---
name: setup-design
description: Configure a repo for /design. It checks the skills /design needs, then writes docs/agents/design.md, the design labels, the deploy exclusion for stills, and the AGENTS.md pointer. Run it once per repo, before a designer's first /design.
disable-model-invocation: true
---

# Setup design

Prepare a repo so a designer can run `/design` in it: explore, confirm each value with the user, then write.

## 1. Check what /design stands on

Stop at the first gap and tell the user how to close it.

- **Skills**: `design`, and the ones it checks for under _Before anything_ in its `SKILL.md`. For any missing, give the install commands from step 5, and stop.

- **Files**: `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`. Without them, stop and tell the user to run `/setup-matt-pocock-skills` first.

## 2. Explore

Read the repo for each value `docs/agents/design.md` holds. Look before you assume:

- **Tokens**: where colours, type and spacing are defined (a CSS `@theme` block, a Tailwind config, a tokens JSON), and whether a doc lists them with their sources.
- **Figma**: a file key in the docs or the code (`figma.com/design/<key>`).
- **Dev server**: the start command and the URL it serves a branch at (`package.json` scripts, `AGENTS.md`, the README). Whether a worktree needs a setup script first.
- **Widths**: the desktop and phone widths the frames or the tests use.
- **Stills**: a browser the repo already installs (Playwright, Puppeteer) and its screenshot command.
- **Variants**: where components live, and any existing variant switcher (search for `?variant=`, `Switcher`, old `prototype/*` branches).
- **Never changes**: the backend, by path: database schema and migrations, CMS config, API routes and server-only code, auth, jobs, environment, build and deploy config. Whatever stores, serves or secures data, and anything else a Design branch must leave alone. A repo with no backend still has config and deploy files.
- **Pre-commit**: what the hook runs.
- **Deploys**: how a deploy picks its files (`git archive`, a Dockerfile `COPY`, a platform's ignore file), which decides how stills stay out of it.
- **Agent instructions**: whether `CLAUDE.md` or `AGENTS.md` exists, and its `## Agent skills` block.

## 3. Confirm

Take the sections of [design-template.md](design-template.md) in order, one at a time, each led by the value you found so the user can accept it in a word. Skip a section the repo has nothing for, and leave it out of the file.

## 4. Write

- **`docs/agents/design.md`**, from [design-template.md](design-template.md), with the confirmed values.
- **Labels** on a GitHub tracker, each with `gh label create <name> --description "..." --color <hex>`, skipping any that exist: `design:map`, `design:spec`, `design:research`, `design:prototype`, `design:grilling`, `design:task`, and `ready-for-dev`. A local tracker needs none: its files carry `Status:` lines.
- **`ready-for-dev` in `docs/agents/triage-labels.md`**, so `/triage` lists handed-off specs. In the table's `needs-triage` row, the tracker's label cell becomes "`needs-triage`, and `ready-for-dev` on a Design spec". Under the table:

  ```markdown
  `ready-for-dev` marks a Design spec the designer has handed off, and counts as `needs-triage`. It moves to `needs-info` with a question for the designer, or, once a dev takes it, to `ready-for-agent` or `ready-for-human`. The dev plans the build by starting `/wayfinder` from the spec.
  ```

- **Stills out of deploys.** When deploys build from `git archive`, add `/design-screens export-ignore` to `.gitattributes` (the leading slash, no trailing one: `design-screens/` would match a folder of that name anywhere). Otherwise add `design-screens/` to the deploy's ignore file (`.dockerignore`, `.vercelignore`).
- **The pointer**, in `CLAUDE.md` if it exists, else `AGENTS.md`, as a sub-block of `## Agent skills`. Update it in place if it is already there:

  ```markdown
  ### Design

  Design branches (`design/*`) never merge. A designer's request runs under `/design`, which only the designer can start: ask them to type it. This repo's settings are in `docs/agents/design.md`.
  ```

## 5. Done

Tell the user what was written, and that each designer's machine needs `/design` and the skills it calls, installed once:

```bash
npx skills add GianlucaZoni/skills -g -a claude-code -y -s design
npx skills add mattpocock/skills -g -a claude-code -y -s grilling domain-modeling research
```
