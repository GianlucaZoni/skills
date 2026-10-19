---
name: design
description: Work a designer's request on the real site, on a Design branch that never merges, and hand what it settles to a dev as a Design spec. Takes a request in words, or the number of a Design map, ticket or spec.
disable-model-invocation: true
---

# Design

A designer with access to the repo wants to try something on the real site: change a style, test a feature before a dev builds it, or explore an idea. Often they have no technical vocabulary. The work happens on a **Design branch**, `design/<topic>`. What it settles reaches main only through a **Design spec**, an issue a dev builds from on a fresh branch. A request too big for one session becomes a **Design map**: tickets settled one session each, ending in one Design spec or several.

## Before anything

1. Read `docs/agents/design.md`. It names this repo's token file and tokens doc, the dev server and its URL, the widths to check, the variants folder and switcher, the stills command, and what a Design branch never changes. If it is missing, stop and tell the designer: "This repo isn't set up for /design yet. Ask a dev to run /setup-design."
2. Check that `grilling`, `domain-modeling` and `research` are in your available skills. If any is missing, stop and give the designer the command that installs them:

   ```bash
   cd ~
   npx skills add mattpocock/skills -g -a claude-code universal -y -s grilling domain-modeling research
   ```

3. Read `docs/agents/issue-tracker.md` and `docs/agents/domain.md`, and follow them.

## Talking to the designer

These hold on every path below.

- **Chase the intent.** The designer's words name an effect ("calmer", "more air", "it feels cheap"). Your job is the change that produces it. Ask about what they want a reader to see or feel, what is wrong today, and what would count as good enough: one question at a time, in plain words.
- **Translate every question into what the reader sees.** When grilling turns up a technical fork, pick the branch yourself and ask the designer only about its visible effect: "Should the date sit above the title or beside it?", never "a flex row or a grid?".
- **Every technical choice is yours**: the file, the component, the CSS, how to stand in for missing data. Decide and move on.
- **Report what they will see**: what changed, where on the page, and the URL to open. Show code only when asked.
- **Name parts of the site by the glossary**, with a plain gloss the first time ("the Footer, the strip at the bottom of every page").
- **Say plainly when a request reaches past the branch**, and offer the stand-in: "That needs the site to store something new, which a dev decides. I'll use fixed text for now and flag it in the spec."

## Guardrails

The Design branch leaves the machine by `git push` and nothing else. These are hard limits:

- **The frontend is the designer's, the backend is the dev's.** Read whatever the backend already serves, and leave everything that stores, serves or secures data as it is: database schema and migrations, CMS collections and fields, API routes and server logic, auth, environment and config. Data the backend lacks goes in a hardcoded `content.ts` beside the variants, and the spec flags it for the dev.
- **No pull request, no merge, no deploy.** A dev who wants the client to click through deploys it on purpose.
- **A fresh branch for each question**, from `origin/main` just fetched. An old Design branch stays as it is, the record of what was tried.
- Whatever `docs/agents/design.md` lists under "Never changes".

## Invocation

- **A request in words**: [New request](#new-request).
- **A number**: read the issue's labels.
  - `design:map`, or a ticket on one (`design:research`, `design:prototype`, `design:grilling`, `design:task`): work it, per [MAP.md](MAP.md).
  - `design:spec` alone, a draft: check out its Design branch, start the dev server, and read the spec's Intent and Variants tried back to the designer. Then carry on at step 4 of [New request](#new-request).
  - `design:spec` with `needs-info`: [Answer a dev's questions](#answer-a-devs-questions).
  - `design:spec` with `ready-for-dev`: it is with a dev. Tell the designer so. A change they still want goes on the issue as a comment for the dev.

### New request

1. **Understand the intent.** Call the Skill tool twice, for "grilling" and "domain-modeling". Done when you can say in one sentence what changes, where, and how the designer will judge it.
2. **Say it back** in one message: that sentence, the kind of request, and what it ends in. Wait for the designer's yes. The kinds:
   - **Style change**: a colour, type style or spacing value changes everywhere it is used. Ends in a Design spec.
   - **Feature test**: a new or changed component or page, compared as variants. Ends in a Design spec.
   - **Exploration**: "let me try something". Ends in a Design spec, a Design map, or a verdict.

   When the request holds two or more separate design questions, each needing variants of its own, or the designer asks for a map, chart a Design map instead, per [MAP.md](MAP.md).
3. **Open the Design branch**: `git fetch origin`, then `design/<topic>` from `origin/main`. Start the dev server as `docs/agents/design.md` says, and give the designer the URL.
4. **Work in rounds.** Each round:
   1. **Build.** A style change edits the token in the token file, in place, so every use of it changes. A feature test or an exploration builds variants, per [VARIANTS.md](VARIANTS.md). A fact from outside the repo (a font's licence, how a pattern behaves elsewhere) goes to a subagent that calls the Skill tool for "research".
   2. **Measure** what you built through the DOM, at the widths `docs/agents/design.md` names, and keep the numbers: they fill the spec's Measurements.
   3. **Show** it: the URL and what changed, in the designer's terms. They react.
   4. **Commit** what they keep, and what they turn down: the spec cites both. Glossary and ADR edits from domain-modeling go in a commit of their own, so a dev can cherry-pick it.
   5. **Take stills** of each new state at both widths, with the stills command, under `design-screens/<topic>/<variant>-<width>.png`, and commit them.
   6. **Push**, then open the Design spec per [SPEC.md](SPEC.md) on the first round that keeps something, or update it on every round after. Send the designer its URL when it opens.

   The rounds end when the designer says the direction holds, or the session ends. When the work turns out to hold parts a dev could ship and deploy without each other, propose one spec per part; the designer confirms the split.
5. **Close the session.** Push the branch. Then one of:
   - The designer says the spec is done: [Handoff](#handoff).
   - Not done yet: tell them `/design <spec number>` picks it up next time.
   - An exploration whose verdict is to change nothing: write the verdict and the reason in the last commit message and push. Close the draft spec, if one is open, with the verdict as its comment. Tell the designer the branch name: the branch is the record.

### Handoff

The **Handoff** happens on the designer's word that the spec is done, and only then. Before it, check the spec against [SPEC.md](SPEC.md): every section filled or marked "None", every measurement a check a dev can run, every still linked by a pushed commit. Then add the `ready-for-dev` label (on a local tracker, set the file's `Status:` line). Tell the designer a dev picks it up from here, and that a question from the dev arrives as `needs-info`, answered with `/design <spec number>`.

### Answer a dev's questions

1. Read the comments since the Handoff: they hold the dev's questions.
2. Check out the Design branch and start the dev server. Put each question to the designer in plain words. Where an answer needs trying, work a round, as step 4 of [New request](#new-request) says.
3. Update the spec's body, which stays the single source, and comment with what changed. Swap `needs-info` for `ready-for-dev`.
