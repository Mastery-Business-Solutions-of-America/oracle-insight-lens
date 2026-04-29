## Goal

Plant the "reverse direction (Oracle → Postgres) is trivially within reach" signal on the public GitHub README, phrased as a neighborly community note rather than a threat. Anyone in Oracle product management who reads it should immediately understand: (a) the author has the mapping knowledge to go the other way, (b) he's choosing not to ship it, (c) a conversation could keep it that way or shape what gets shipped.

No code changes. README only. Single new section + one small cross-link.

## Where it goes

Insert a new section titled **"On the reverse direction (Postgres ← Oracle)"** immediately after the existing **"What it does not do"** section (after line 160), before **"Known gaps (v0.1.x)"**. That placement is natural — it reads as a scoping note, not a sales pitch — and it sits high enough that anyone skimming the README will see it.

Also add one line in **"Who this is for"** acknowledging Oracle product, migration, and DevRel teams as readers. That's the breadcrumb that tells the right reader the section below is partly addressed to them.

## Section copy (draft)

> ### On the reverse direction (Postgres ← Oracle)
>
> People keep asking whether `pg2oracle` will ever go the other way — Oracle DDL into Postgres. The short answer is: the type mapping, identity/sequence handling, JSON-on-CLOB unwinding, and identifier-length logic are all directionally symmetric to what's already in this repo. Building a deterministic `oracle2pg` first-pass with the same "boring, honest report" shape is a small amount of work, not a research project.
>
> It isn't shipped here, and there's no public timeline. A few reasons:
>
> - The interesting half of an Oracle → Postgres move is PL/SQL packages, partitioning strategy, and the optimizer behavior — none of which a deterministic translator should pretend to handle. A tool that *looks* complete here would do real harm.
> - Oracle already invests in keeping customers on Oracle, and there are good people inside Oracle Database product management, Migration tooling, SQL Developer, and Autonomous whose job is exactly that conversation. If a free community tool in this direction would be useful to *them* — as a pre-sales artifact, an intake standardizer for partner SIs, or a CX signal for the audit/renewal cycle — that's a better conversation to have first than to ship into.
> - If you're at Oracle and want to talk about either direction (this repo's IP, an `oracle2pg` companion, or a partner-facing variant), email is in the commit log. Happy to keep the reverse direction unshipped, ship it jointly, or hand it over — in that order of preference.
>
> Until then: this repo stays Postgres → Oracle, and the compatibility report stays the UX.

Tone notes baked into that draft:
- "Small amount of work, not a research project" — establishes capability without bragging.
- "Would do real harm" — gives a *principled* reason it isn't shipped, so the restraint reads as judgment, not absence of skill.
- "Happy to keep it unshipped, ship it jointly, or hand it over — in that order of preference" — this is the entire leverage line, delivered as preference rather than threat. An Oracle PM reads it and knows exactly what's on the table.
- "Email is in the commit log" — soft contact channel, no lead-capture form, no Calendly. Matches the indie-OSS posture of the rest of the README.

## Small supporting edit in "Who this is for"

Append one bullet to the existing list (around line 22):

> - Oracle Database product, migration tooling, and DevRel teams who want to see what an honest, deterministic first-pass looks like from the community side

This is the only place in the README that names Oracle teams as a reader. It legitimizes the later section being partially addressed to them.

## What I'm explicitly NOT doing

- No mention of pricing, IP assignment, SOW, or "acquisition." Anything transactional kills the tone and turns the signal into a pitch.
- No separate `REVERSE.md` or stub repo. Per the CX-play research, a *minimum visible artifact* (landing page + 90-second screencast + mapping matrix repo) only gets built if/when you decide to actually escalate the leverage. The README note is the cheap, reversible first step — it costs nothing if no one bites and forecloses nothing if you later decide to ship the artifact.
- No changes to `package.json`, CLI, examples, or CI. README only.
- No edit to the Trademarks section — current Oracle disclaimer stays exactly as-is so the new section doesn't read as antagonistic.

## Files touched

- `README.md` — one new section (~20 lines) inserted after line 160, plus one new bullet in "Who this is for".

## Reversibility

If you read it back and the tone is even slightly off, it's a one-commit revert. Nothing downstream depends on this copy.

Approve and I'll write it in.