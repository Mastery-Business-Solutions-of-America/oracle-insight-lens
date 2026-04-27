# Contributing to pg2oracle

Thanks for your interest. `pg2oracle` is intentionally **boring**: hardcoded
mappings, no AST round-trips, no clever inference. Contributions should
preserve that character.

## Development setup

Requires **Node 22+** and [Bun](https://bun.sh) (for the dev scripts).

```bash
git clone https://github.com/sambolt/pg2oracle.git
cd pg2oracle
bun install
bun run verify   # typecheck + tests + build + UAT
```

## Project layout

| Path | Purpose |
|------|---------|
| `src/cli.ts` | CLI entry, flag parsing, file I/O |
| `src/translate.ts` | Statement-level translation logic |
| `src/map.ts` | Type and default-expression mappings (the hardcoded table) |
| `src/report.ts` | Compatibility report rendering |
| `tests/` | Vitest unit tests |
| `scripts/uat.sh` | End-to-end acceptance criteria |
| `examples/ghost/` | Worked example: Ghost CMS schema |

## Pull request checklist

Before opening a PR, run:

```bash
bun run verify
```

All four steps (typecheck, tests, build, UAT) must pass. CI runs the same
command on every push and PR.

If you change behavior, add or update tests **and** UAT criteria. The UAT
script is the source of truth for "what this tool actually does."

## What we accept

- New type mappings (with test + UAT case + README row)
- Better warnings on edge cases the report currently misses
- Documentation fixes
- Bug fixes with a regression test

## What we don't accept

- AST-based rewrites or PL/pgSQL translation — out of scope by design
- Identifier renaming, default invention, or any "clever" transformation
  that changes user input without a warning
- Network calls during translation
- New runtime dependencies (the published bundle has zero deps)

## Reporting issues

Include:

1. Minimal Postgres DDL that reproduces the problem
2. The actual `pg2oracle` output
3. The expected Oracle output (and why)
4. Output of `pg2oracle --version`

## License

By contributing, you agree your contributions are licensed under the MIT License.
