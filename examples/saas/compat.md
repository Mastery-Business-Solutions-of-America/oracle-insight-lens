# pg2oracle compatibility report

Source: `examples/saas/postgres.sql`
Generated: 2026-04-28T16:26:24.250Z
Target: Oracle Database 19c / 21c+ (default landing zone)

## Summary

- **High severity:** 11 (will likely break on Oracle)
- **Warnings:** 15 (lossy or behavior change)
- **Info:** 0

## High severity

- **[extension]** `CREATE EXTENSION` is Postgres-only. Statement dropped — find Oracle equivalents (e.g. uuid-ossp → SYS_GUID, pgcrypto → DBMS_CRYPTO).
- **[extension]** `CREATE EXTENSION` is Postgres-only. Statement dropped — find Oracle equivalents (e.g. uuid-ossp → SYS_GUID, pgcrypto → DBMS_CRYPTO).
- **[default expression dropped]** _(table tenants, column id)_ DEFAULT `gen_random_uuid()` has no Oracle equivalent before 21c. Default removed from output — application must supply UUIDs on insert, or add a BEFORE INSERT trigger using SYS_GUID().
- **[type mapping]** _(table tenants, column settings)_ jsonb → CLOB with IS JSON check. jsonb's binary storage and indexing semantics do NOT translate; queries using jsonb operators (@>, ->) must be rewritten.
- **[default expression dropped]** _(table users, column id)_ DEFAULT `gen_random_uuid()` has no Oracle equivalent before 21c. Default removed from output — application must supply UUIDs on insert, or add a BEFORE INSERT trigger using SYS_GUID().
- **[default expression dropped]** _(table workspaces, column id)_ DEFAULT `gen_random_uuid()` has no Oracle equivalent before 21c. Default removed from output — application must supply UUIDs on insert, or add a BEFORE INSERT trigger using SYS_GUID().
- **[type mapping]** _(table workspaces, column metadata)_ jsonb → CLOB with IS JSON check. jsonb's binary storage and indexing semantics do NOT translate; queries using jsonb operators (@>, ->) must be rewritten.
- **[default expression dropped]** _(table projects, column id)_ DEFAULT `gen_random_uuid()` has no Oracle equivalent before 21c. Default removed from output — application must supply UUIDs on insert, or add a BEFORE INSERT trigger using SYS_GUID().
- **[type mapping]** _(table projects, column config)_ jsonb → CLOB with IS JSON check. jsonb's binary storage and indexing semantics do NOT translate; queries using jsonb operators (@>, ->) must be rewritten.
- **[default expression dropped]** _(table api_keys, column id)_ DEFAULT `gen_random_uuid()` has no Oracle equivalent before 21c. Default removed from output — application must supply UUIDs on insert, or add a BEFORE INSERT trigger using SYS_GUID().
- **[type mapping]** _(table audit_events, column payload)_ jsonb → CLOB with IS JSON check. jsonb's binary storage and indexing semantics do NOT translate; queries using jsonb operators (@>, ->) must be rewritten.

## Warnings

- **[type mapping]** _(table tenants, column id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table users, column id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table users, column tenant_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table users, column is_active)_ boolean → NUMBER(1): true/false rewritten as 1/0. CHECK constraints not auto-added.
- **[type mapping]** _(table workspaces, column id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table workspaces, column tenant_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table projects, column id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table projects, column tenant_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table projects, column workspace_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table api_keys, column id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table api_keys, column tenant_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table api_keys, column user_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table audit_events, column tenant_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table audit_events, column actor_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.
- **[type mapping]** _(table audit_events, column target_id)_ uuid → RAW(16): application must convert UUID strings to 16-byte binary on insert.

## Oracle edition & option signals

> Observational only. Schema features below would, on a like-for-like Oracle landing zone, involve the listed Oracle Database editions or options. Final licensing depends on your Oracle contract, deployment model (on-prem, OCI, ADB), and actual usage — verify with your Oracle account team or License Management Services. `pg2oracle` is not affiliated with Oracle Corporation and does not provide licensing advice.

| Signal | Oracle feature involved | Verification |
| --- | --- | --- |
| JSON / JSONB columns in use | Native JSON type (21c+) or JSON-on-CLOB (12c–19c) | On 21c+ prefer the native `JSON` type for performance. On 19c, `CLOB CHECK (col IS JSON)` is standard and included in all editions. Search indexes on JSON may involve Oracle Text. |
| Row-level security policies detected | Virtual Private Database (VPD) / Oracle Label Security (OLS) | VPD is included in EE. OLS is a separately licensed EE option. Re-implementation is required — Postgres `CREATE POLICY` does not translate. |
| pgcrypto extension in use | DBMS_CRYPTO (built-in) / Advanced Security option | DBMS_CRYPTO is included in all editions for application-level crypto. Transparent Data Encryption (TDE) and column encryption are part of the Advanced Security EE-only option on on-prem; included in ADB. |
| uuid-ossp / gen_random_uuid() in use | SYS_GUID() (built-in) / native UUID handling | No license impact. Replace with `SYS_GUID()` returning RAW(16); applications generating UUIDs client-side need to encode to 16-byte binary. |

---
pg2oracle translates types; it never renames your objects.
Report format: observation → Oracle implication → verify. No licensing advice.
