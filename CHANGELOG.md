# Changelog

All notable changes to `pg2oracle` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] — 2026-04-28

### Changed

- Tightened published tarball: only `dist/cli.cjs` ships (no stray
  `dist/` artifacts).
- Bumped minimum supported Node from 18 to 20 (current LTS).
- Expanded npm keywords for discoverability.

### Added

- README badges: npm version, monthly downloads, license, supported Node.

## [0.1.0] — 2026-04-27

Initial public release.

### Added

- CLI: `pg2oracle <input> -o <output>` with stdin/stdout piping support
- ~30 hardcoded Postgres → Oracle type mappings (see README)
- Default-expression rewriting: `now()` → `SYSTIMESTAMP`, boolean
  `true`/`false` → `1`/`0`, `gen_random_uuid()` dropped with warning.
  `CURRENT_TIMESTAMP` is left as-is (valid on Oracle).
- Statement handling: `CREATE TABLE` (with `IF NOT EXISTS` stripped + warned),
  `CREATE INDEX`, `ALTER TABLE` (preserved verbatim with warning),
  `COMMENT ON`, `CREATE EXTENSION` (dropped), `CREATE FUNCTION/PROCEDURE/TRIGGER`
  (preserved verbatim with high-severity warning)
- Markdown compatibility report (`--report <file>`) with three severity
  levels: `high`, `warn`, `info`
- `--strict` flag: exit code 2 on any warnings (CI-friendly)
- Worked example: Ghost CMS schema (`examples/ghost/`)
- 29 unit tests + 22-criterion UAT script
- Single-file build (~134 KB, no runtime deps) targeting Node 22+

[0.1.1]: https://github.com/Mastery-Business-Solutions-of-America/oracle-insight-lens/releases/tag/v0.1.1
[0.1.0]: https://github.com/Mastery-Business-Solutions-of-America/oracle-insight-lens/releases/tag/v0.1.0
