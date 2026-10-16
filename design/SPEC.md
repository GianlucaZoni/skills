# Design spec

The issue a dev builds from. The designer reads it to say yes and the dev reads it to build, so write Intent and Variants tried for the designer, and the rest for the dev. The dev plans the build by starting `/wayfinder` from the spec, and builds on a fresh branch from main: the spec has to stand on its own, with the Design branch as evidence, not as code to merge.

## Where it lives

Publish it as `docs/agents/issue-tracker.md` says. On GitHub that is an issue, titled with what changes ("Footer: calmer columns"), labelled `design:spec` while it is a draft; the Handoff adds `ready-for-dev`. On a local tracker it is a file named `DESIGN-SPEC-<topic>.md`, where the tracker keeps its issues, with a `Status: draft` line that the Handoff turns to `Status: ready-for-dev`. Leave that file uncommitted, out of the Design branch, so the dev finds it from main and commits it there. A spec written from a Design map is a child of the map.

## Stills

Embed a still with a link pinned to the commit that holds it, so it never moves. The commit has to be on origin first, or the image is broken: push, then link.

```markdown
![Variant B at 1280](https://github.com/<owner>/<repo>/blob/<sha>/design-screens/<topic>/b-1280.png?raw=true)
```

A screen recording is the designer's to add: they drag it into a comment by hand. Mention it once, when you send them the spec's URL.

## The body

Every section is present. One with nothing to say reads "None".

```markdown
## Intent

<What the designer wants a reader to see or feel, and what is wrong today. Their words first, then the same thing in the glossary's terms.>

## Where

<The parts of the site it touches, by glossary name: pages, components, states.>

## Glossary

<Terms this change adds or redefines, quoted as domain-modeling wrote them in `GLOSSARY.md` (and any ADR). Their commit is listed under Design branch, for the dev to cherry-pick or rewrite.>

## Tokens

| Token | Old | New | Source |
| ----- | --- | --- | ------ |
| <token> | <value> | <value> | <this spec, or the Figma node> |

<A value this spec settles has "this spec" as its source. The dev cites the spec's number in the tokens doc, as `docs/agents/design.md` says.>

## Measurements

<Checks a dev can run on the built page, each with its element, its number and its width:>

- [ ] At <desktop width>, <element> <property> is <value>.
- [ ] At <phone width>, <element> <property> is <value>.

## Behaviour

<Hover, focus, motion (what moves, how long, which easing), the empty case, the case with very long content.>

## Content

<What the change shows and where in the backend it comes from (a CMS field, an API, a table). Anything the backend lacks: "Needs backend data: <what>. A decision for the dev." The Design branch stood in for it with fixed text.>

## Variants tried

- **<Kept variant>**: kept, because <the designer's reason>. <still>
- **<Variant>**: turned down, because <the designer's reason>. Commit `<sha>`. <still>

## Design branch

[`design/<topic>`](<branch URL>)

<Commits worth cherry-picking: the token edits and the glossary commit, by sha, each with one line on what it changes. Everything under the `design-<topic>/` variants folder is prototype code, to be rebuilt.>

## Open questions

<What the designer left to the dev, or could not decide.>
```

From a Design map, Variants tried and Design branch gather every ticket the spec draws on: each ticket's branch, its variants and its verdict, linked by the ticket's name.
