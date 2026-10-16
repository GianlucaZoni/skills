# Design map

A request too big for one session, wrapped in fog: the way to the spec isn't visible yet. The **Design map** charts it as one issue whose child tickets are design decisions, settled one per session until the way is clear. A map plans: each ticket ends in a decision, and the map ends in one Design spec, or several.

The issue-tracker mechanics (sub-issues, native blocking, claiming, the frontier query) are in the "Wayfinding operations" section of `docs/agents/issue-tracker.md`. Follow them with the labels below in place of the `wayfinder:` ones.

## Refer by name

Every map and ticket is an issue with a title. In everything the designer reads, refer to it by that title, with the link inside it, never by a bare number.

## The map

One issue labelled `design:map`. It is an index: it gists each decision and links the ticket that holds it. Open tickets are not listed; they are found by query.

```markdown
## Destination

<One Design spec for <what>. Several when parts of the request can ship without each other.>

## Notes

<The intent in the designer's words, the pages it touches, standing preferences.>

## Decisions so far

- [<closed ticket title>](link): <one-line gist of the answer>

## Not yet specified

<In-scope questions too blurry to ticket yet.>

## Out of scope

- <gist>, because <why>. [<closed ticket title>](link)
```

## Tickets

Each ticket is a child issue whose body is one question, sized to one session:

```markdown
## Question

<the design decision or fact this ticket settles>
```

Each carries one type label:

- **`design:grilling`**: a conversation with the designer. The default. Call the Skill tool twice, for "grilling" and "domain-modeling".
- **`design:prototype`**: variants on the real site to react to, on a Design branch of its own from a freshly fetched `origin/main`, linked from the ticket. Work it in rounds, as step 4 of the SKILL's New request says, with the ticket's resolution comment in place of the spec.
- **`design:research`**: a fact from outside the repo. A subagent that calls the Skill tool for "research" settles it alone.
- **`design:task`**: work that must happen before a decision can be made: a Figma frame exported, a font installed. Done by you where you can, otherwise a checklist for the designer.

Only the designer can settle a grilling or prototype ticket. Their side of the exchange is theirs.

**Ticket or fog?** Ticket when you can state the question precisely now, even if it is blocked. Fog, in Not yet specified, when you can't phrase it that sharply yet. Work past the destination is out of scope: close its ticket and give it a line in Out of scope.

## Chart the map

1. **Name the destination**: grill (Skill tool, "grilling" and "domain-modeling") until you and the designer agree what the spec, or specs, will cover.
2. **Map the frontier**: grill breadth-first across the whole request for the open questions and the first ones takeable now. If none turn up, the request fits one session: go back to New request in the SKILL.
3. **Create the map**, with Destination and Notes filled in and the fog sketched.
4. **Create the tickets** you can state now, then wire their blocking in a second pass, once each has an id.
5. **Fire the research tickets**, each to its own subagent.
6. Stop. Charting is the session's work.

## Work through the map

One ticket per session, research tickets aside.

1. Load the map body.
2. Take the ticket the designer named, or else the first on the frontier. **Claim it** before any work.
3. Settle it with the designer, zooming into related tickets as needed.
4. Post the answer as a comment, close the ticket, and add its line to Decisions so far.
5. Create the tickets the answer makes possible, graduating their fog. Update or close any ticket the answer makes wrong.

## When the map clears

The map is clear when no open tickets are left and Not yet specified is empty. Propose the specs: one by default, one per part a dev can ship and deploy on its own when the request is too big for one. The designer confirms. Write each spec as [SPEC.md](SPEC.md) says, from the map's decisions, as a child of the map. Close the map with a link to each spec. The Handoff follows, spec by spec.
