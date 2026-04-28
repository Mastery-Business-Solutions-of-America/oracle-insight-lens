# pg2oracle compatibility report

Source: `examples/ghost/postgres.sql`
Generated: 2026-04-28T16:26:24.423Z
Target: Oracle Database 19c / 21c+ (default landing zone)

## Summary

- **High severity:** 2 (will likely break on Oracle)
- **Warnings:** 2 (lossy or behavior change)
- **Info:** 0

## High severity

- **[default expression dropped]** _(table posts, column uuid)_ DEFAULT `gen_random_uuid()` has no Oracle equivalent before 21c. Default removed from output — application must supply UUIDs on insert, or add a BEFORE INSERT trigger using SYS_GUID().
- **[type mapping]** _(table sessions, column session_data)_ jsonb → CLOB with IS JSON check. jsonb's binary storage and indexing semantics do NOT translate; queries using jsonb operators (@>, ->) must be rewritten.

## Warnings

- **[type mapping]** _(table posts, column uuid)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table posts, column featured)_ boolean → NUMBER(1): true/false rewritten as 1/0. CHECK constraints not auto-added.

## Oracle edition & option signals

> Observational only. Schema features below would, on a like-for-like Oracle landing zone, involve the listed Oracle Database editions or options. Final licensing depends on your Oracle contract, deployment model (on-prem, OCI, ADB), and actual usage — verify with your Oracle account team or License Management Services. `pg2oracle` is not affiliated with Oracle Corporation and does not provide licensing advice.

| Signal | Oracle feature involved | Verification |
| --- | --- | --- |
| JSON / JSONB columns in use | Native JSON type (21c+) or JSON-on-CLOB (12c–19c) | On 21c+ prefer the native `JSON` type for performance. On 19c, `CLOB CHECK (col IS JSON)` is standard and included in all editions. Search indexes on JSON may involve Oracle Text. |
| uuid-ossp / gen_random_uuid() in use | SYS_GUID() (built-in) / native UUID handling | No license impact. Replace with `SYS_GUID()` returning RAW(16); applications generating UUIDs client-side need to encode to 16-byte binary. |
| Wide CLOB / BLOB columns suggest compression value | Advanced Compression option (Enterprise Edition) | If LOB compression or OLTP table compression is in scope, Advanced Compression is an EE-only paid option on on-prem. Confirm whether workload justifies it. |

---
pg2oracle translates types; it never renames your objects.
Report format: observation → Oracle implication → verify. No licensing advice.
