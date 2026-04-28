/**
 * License / edition signal catalog.
 *
 * Centralized so the wording is consistent across every detection site and
 * easy to audit. Each entry is observational — it names the Oracle feature
 * that would be involved on a like-for-like landing zone and asks the reader
 * to verify against their contract. We never assert what is owed.
 *
 * Naming convention for `key`: `<area>.<feature>`. Stable across versions.
 */
import type { Report } from "./report.js";

export type SignalKey =
  | "partitioning.range"
  | "partitioning.list"
  | "partitioning.hash"
  | "json.usage"
  | "advanced.compression"
  | "rls.policy"
  | "materialized.view"
  | "spatial.geometry"
  | "fulltext.search"
  | "extension.pgcrypto"
  | "extension.uuid"
  | "extension.postgis"
  | "extension.pgvector"
  | "long.identifier"
  | "schema.multitenancy";

interface SignalDef {
  observation: string;
  oracleFeature: string;
  implication: string;
}

const CATALOG: Record<SignalKey, SignalDef> = {
  "partitioning.range": {
    observation: "Range partitioning detected",
    oracleFeature: "Oracle Partitioning option (Enterprise Edition)",
    implication:
      "Partitioning is an EE-only option on on-prem Oracle DB. Included in Autonomous Database. Confirm target edition.",
  },
  "partitioning.list": {
    observation: "List partitioning detected",
    oracleFeature: "Oracle Partitioning option (Enterprise Edition)",
    implication:
      "Partitioning is an EE-only option on on-prem Oracle DB. Included in Autonomous Database. Confirm target edition.",
  },
  "partitioning.hash": {
    observation: "Hash partitioning detected",
    oracleFeature: "Oracle Partitioning option (Enterprise Edition)",
    implication:
      "Partitioning is an EE-only option on on-prem Oracle DB. Included in Autonomous Database. Confirm target edition.",
  },
  "json.usage": {
    observation: "JSON / JSONB columns in use",
    oracleFeature: "Native JSON type (21c+) or JSON-on-CLOB (12c–19c)",
    implication:
      "On 21c+ prefer the native `JSON` type for performance. On 19c, `CLOB CHECK (col IS JSON)` is standard and included in all editions. Search indexes on JSON may involve Oracle Text.",
  },
  "advanced.compression": {
    observation: "Wide CLOB / BLOB columns suggest compression value",
    oracleFeature: "Advanced Compression option (Enterprise Edition)",
    implication:
      "If LOB compression or OLTP table compression is in scope, Advanced Compression is an EE-only paid option on on-prem. Confirm whether workload justifies it.",
  },
  "rls.policy": {
    observation: "Row-level security policies detected",
    oracleFeature: "Virtual Private Database (VPD) / Oracle Label Security (OLS)",
    implication:
      "VPD is included in EE. OLS is a separately licensed EE option. Re-implementation is required — Postgres `CREATE POLICY` does not translate.",
  },
  "materialized.view": {
    observation: "Materialized views detected",
    oracleFeature: "Materialized views (all editions; refresh modes vary)",
    implication:
      "Available in all editions, but `FAST REFRESH` requires materialized view logs and matching SQL patterns. Re-author refresh strategy for Oracle.",
  },
  "spatial.geometry": {
    observation: "Geometry / geography columns (PostGIS) detected",
    oracleFeature: "Oracle Spatial / Locator",
    implication:
      "Locator (basic spatial) is included in all editions. Full Spatial is a separately licensed EE option on on-prem; included in ADB. Geometry semantics differ — re-author with `SDO_GEOMETRY`.",
  },
  "fulltext.search": {
    observation: "Full-text search constructs (tsvector / GIN) detected",
    oracleFeature: "Oracle Text",
    implication:
      "Oracle Text is included in all editions. Index types and query syntax (`CONTAINS`, `MATCHES`) differ from Postgres `to_tsvector` — rewrite required.",
  },
  "extension.pgcrypto": {
    observation: "pgcrypto extension in use",
    oracleFeature: "DBMS_CRYPTO (built-in) / Advanced Security option",
    implication:
      "DBMS_CRYPTO is included in all editions for application-level crypto. Transparent Data Encryption (TDE) and column encryption are part of the Advanced Security EE-only option on on-prem; included in ADB.",
  },
  "extension.uuid": {
    observation: "uuid-ossp / gen_random_uuid() in use",
    oracleFeature: "SYS_GUID() (built-in) / native UUID handling",
    implication:
      "No license impact. Replace with `SYS_GUID()` returning RAW(16); applications generating UUIDs client-side need to encode to 16-byte binary.",
  },
  "extension.postgis": {
    observation: "PostGIS extension in use",
    oracleFeature: "Oracle Spatial / Locator",
    implication:
      "See spatial.geometry. Locator covers basic point/line/polygon; Spatial adds advanced analysis (network, raster, topology) and is an EE-only option on on-prem.",
  },
  "extension.pgvector": {
    observation: "pgvector extension in use (AI / similarity search)",
    oracleFeature: "Oracle AI Vector Search (23ai+)",
    implication:
      "Vector data type and similarity indexes are included in Oracle Database 23ai across all editions. Earlier versions have no equivalent — target 23ai or a vector-capable Autonomous Database.",
  },
  "long.identifier": {
    observation: "Identifiers exceed 30 characters",
    oracleFeature: "Oracle 12.2+ extended identifier length (128 chars)",
    implication:
      "11g and 12.1 cap identifiers at 30 chars and will reject this schema. 12.2 and later (including 19c, 21c, ADB) support 128 chars. Confirm target version is 12.2+.",
  },
  "schema.multitenancy": {
    observation: "Multi-schema or tenant-per-schema design observed",
    oracleFeature: "Oracle Multitenant option (PDB-per-tenant) — optional",
    implication:
      "Up to 3 user PDBs are included with EE in 19c+ at no extra cost; beyond that, Multitenant is a separately licensed EE option on on-prem (included in ADB). Schema-as-tenant in Oracle is also viable without Multitenant.",
  },
};

export function emitSignal(report: Report, key: SignalKey, location?: string): void {
  const def = CATALOG[key];
  report.signal({
    key,
    observation: def.observation,
    oracleFeature: def.oracleFeature,
    implication: def.implication,
    location,
  });
}
