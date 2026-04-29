## Goal

Remove every trace of Lovable branding from anything a reader (Oracle PM, GitHub visitor, or anyone clicking the published URL) could see. The repo is otherwise clean — README, CLI, package.json, examples, CI, and HTML stub have zero Lovable references. Two surfaces still leak the brand.

## What to change

### 1. `scripts/dev-stub.mjs` — rewrite the two header comments

Current (lines 2 and 7) name "Lovable" explicitly:

```
// pg2oracle is a Node CLI, not a web app. The Lovable preview platform expects a
// dev server on a port — this stub satisfies the healthcheck and serves a
// simple HTML page explaining what the project actually is.
...
// Accept --port N (Lovable passes this) or fall back to PORT env / 8080.
```

Replace with brand-neutral wording. Proposed:

```
// pg2oracle is a Node CLI, not a web app. Some preview/hosting environments
// expect a dev server on a port — this stub satisfies the healthcheck and
// serves a simple HTML page explaining what the project actually is.
...
// Accept --port N (passed by the host environment) or fall back to PORT env / 8080.
```

The served HTML body itself contains no Lovable references and stays as-is.

### 2. Hide the Lovable badge on the published site

`publish_settings--get_badge_visibility` reports `hide_badge: false`, meaning the floating "Edit with Lovable" badge is currently rendered on `https://oracle-insight-lens.lovable.app`. Call `publish_settings--set_badge_visibility` with `hide_badge: true` so the badge is removed from the published page.

## What I checked and is already clean

- `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE` — no Lovable mentions
- `package.json`, `tsconfig.json`, `scripts/build.mjs`, `scripts/uat.sh` — clean
- `src/**` (CLI source), `tests/**`, `examples/**` — clean
- `.github/**` (CI + issue templates) — clean
- The HTML served by `dev-stub.mjs` — title, meta, body, footer all say "pg2oracle" only
- `bun.lock` contains `lovable-core-prod` strings inside npm registry URLs. These are private to the lockfile, never shipped, never visible to any human reading the repo on GitHub or running the CLI. Leaving them alone — rewriting them would corrupt the lockfile and they re-appear on the next `bun install` anyway.

## What this does NOT touch

- The published subdomain itself (`oracle-insight-lens.lovable.app`) is assigned by the host. Removing it requires attaching a custom domain, which is out of scope for "remove branding from the codebase." Flagging it here so you know it's the one remaining surface — say the word and I'll add a step to wire up a custom domain.
- The `.lovable/` directory (contains the prior `plan.md`) is not part of the published build or the GitHub-visible source tree as configured; it's local agent state. Leave alone.

## Files touched

- `scripts/dev-stub.mjs` — two comment edits
- Publish settings — toggle `hide_badge` to `true` (no file change)

## Reversibility

Both changes are one-line/one-toggle reverts.
