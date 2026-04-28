# pg2oracle compatibility report

Source: `examples/warehouse/postgres.sql`
Generated: 2026-04-28T16:26:24.327Z
Target: Oracle Database 19c / 21c+ (default landing zone)

## Summary

- **High severity:** 2 (will likely break on Oracle)
- **Warnings:** 4 (lossy or behavior change)
- **Info:** 0

## High severity

- **[table option dropped]** _(table fact_sales)_ CREATE TABLE `fact_sales` had trailing clause `PARTITION BY RANGE (sale_ts)` after the column list. Postgres clauses such as INHERITS, PARTITION BY, TABLESPACE, and WITH (...) do not translate to Oracle; clause dropped from output — rewrite manually if needed.
- **[type mapping]** _(table fact_sales, column raw_payload)_ jsonb → CLOB with IS JSON check. jsonb's binary storage and indexing semantics do NOT translate; queries using jsonb operators (@>, ->) must be rewritten.

## Warnings

- **[type mapping]** _(table dim_customer, column is_current)_ boolean → NUMBER(1): true/false rewritten as 1/0. CHECK constraints not auto-added.
- **[type mapping]** _(table dim_product, column is_active)_ boolean → NUMBER(1): true/false rewritten as 1/0. CHECK constraints not auto-added.
- **[type mapping]** _(table dim_date, column is_weekend)_ boolean → NUMBER(1): true/false rewritten as 1/0. CHECK constraints not auto-added.
- **[type mapping]** _(table dim_date, column is_holiday)_ boolean → NUMBER(1): true/false rewritten as 1/0. CHECK constraints not auto-added.

## Oracle edition & option signals

> Observational only. Schema features below would, on a like-for-like Oracle landing zone, involve the listed Oracle Database editions or options. Final licensing depends on your Oracle contract, deployment model (on-prem, OCI, ADB), and actual usage — verify with your Oracle account team or License Management Services. `pg2oracle` is not affiliated with Oracle Corporation and does not provide licensing advice.

| Signal | Oracle feature involved | Verification |
| --- | --- | --- |
| Range partitioning detected | Oracle Partitioning option (Enterprise Edition) | Partitioning is an EE-only option on on-prem Oracle DB. Included in Autonomous Database. Confirm target edition. |
| JSON / JSONB columns in use | Native JSON type (21c+) or JSON-on-CLOB (12c–19c) | On 21c+ prefer the native `JSON` type for performance. On 19c, `CLOB CHECK (col IS JSON)` is standard and included in all editions. Search indexes on JSON may involve Oracle Text. |
| Materialized views detected | Materialized views (all editions; refresh modes vary) | Available in all editions, but `FAST REFRESH` requires materialized view logs and matching SQL patterns. Re-author refresh strategy for Oracle. |

---
pg2oracle translates types; it never renames your objects.
Report format: observation → Oracle implication → verify. No licensing advice.
