/**
 * Postgres DDL → Oracle DDL translator.
 *
 * Strategy: regex-based statement splitter + per-statement rewriter.
 * We deliberately do NOT use a full AST parser here — pgsql-ast-parser
 * mangles edge cases like CREATE INDEX with operator classes, and the
 * translation problem is fundamentally textual (preserve formatting,
 * preserve comments, swap types). A targeted rewriter is safer than
 * a round-trip through AST + pretty-printer.
 *
 * Footgun policy: warn, never rewrite.
 *   - identifiers > 30 chars → warning
 *   - schema-qualified names (public.foo) → warning, output unchanged
 *   - default expressions like now() → warning, expression dropped only
 *     when there's no Oracle equivalent (now() → SYSTIMESTAMP is safe)
 */
import { mapType, type MapResult } from "./map.js";
import { Report } from "./report.js";

export interface TranslateResult {
  oracle: string;
  report: Report;
}

const ORACLE_ID_LIMIT = 30;

/**
 * Split a SQL file into top-level statements, preserving comments and whitespace.
 * Handles dollar-quoted strings ($$...$$) and standard string literals.
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let buf = "";
  let i = 0;
  const n = sql.length;
  let inSingle = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag: string | null = null;

  while (i < n) {
    const c = sql[i]!;
    const next = i + 1 < n ? sql[i + 1] : "";

    if (inLineComment) {
      buf += c;
      if (c === "\n") inLineComment = false;
      i++;
      continue;
    }
    if (inBlockComment) {
      buf += c;
      if (c === "*" && next === "/") {
        buf += next;
        i += 2;
        inBlockComment = false;
        continue;
      }
      i++;
      continue;
    }
    if (dollarTag !== null) {
      buf += c;
      if (c === "$") {
        const rest = sql.slice(i);
        if (rest.startsWith(dollarTag)) {
          buf += dollarTag.slice(1);
          i += dollarTag.length;
          dollarTag = null;
          continue;
        }
      }
      i++;
      continue;
    }
    if (inSingle) {
      buf += c;
      if (c === "'") {
        if (next === "'") {
          buf += next;
          i += 2;
          continue;
        }
        inSingle = false;
      }
      i++;
      continue;
    }

    // Outside strings/comments
    if (c === "-" && next === "-") {
      buf += c;
      inLineComment = true;
      i++;
      continue;
    }
    if (c === "/" && next === "*") {
      buf += c;
      buf += next;
      inBlockComment = true;
      i += 2;
      continue;
    }
    if (c === "'") {
      buf += c;
      inSingle = true;
      i++;
      continue;
    }
    if (c === "$") {
      // Look for $tag$
      const m = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (m) {
        dollarTag = `$${m[1]}$`;
        buf += dollarTag;
        i += dollarTag.length;
        continue;
      }
    }
    if (c === ";") {
      buf += c;
      statements.push(buf);
      buf = "";
      i++;
      continue;
    }
    buf += c;
    i++;
  }
  if (buf.trim().length > 0) statements.push(buf);
  return statements;
}

/**
 * Translate a single CREATE TABLE statement.
 * Returns the Oracle text. Warnings are appended to `report`.
 */
function translateCreateTable(stmt: string, report: Report): string {
  // Strip leading whitespace + SQL comments to find the CREATE clause,
  // but preserve them in the output by capturing the prefix.
  const prefixRe = /^(?:--[^\n]*\n|\/\*[\s\S]*?\*\/|\s+)*/;
  const prefixMatch = stmt.match(prefixRe);
  const prefix = prefixMatch ? prefixMatch[0] : "";
  const rest = stmt.slice(prefix.length);

  // Capture: CREATE TABLE [IF NOT EXISTS] <name> ( <body> ) [tail] ;
  const headerRe = /^(CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?)("?[\w.]+"?(?:\."?[\w]+"?)?)\s*\(([\s\S]*)\)\s*([^;]*);?\s*$/i;
  const m = rest.match(headerRe);
  if (!m) return stmt; // can't parse, leave alone — caller logs nothing

  const [, head, rawName, body, tailRaw] = m;
  if (!head || !rawName || body === undefined) return stmt;
  const tail = (tailRaw ?? "").trim();

  const tableName = rawName.replace(/"/g, "");
  if (tableName.includes(".")) {
    report.add({
      severity: "high",
      category: "schema-qualified name",
      message: `Table \`${tableName}\` uses a Postgres schema prefix. Oracle treats this as <schema>.<table> too, but the schema must exist and the user must have privileges. Output is left unchanged — review before running.`,
      location: `table ${tableName}`,
    });
  }
  const bareName = tableName.split(".").pop() ?? tableName;
  if (bareName.length > ORACLE_ID_LIMIT) {
    report.add({
      severity: "high",
      category: "long identifier",
      message: `Table name \`${bareName}\` is ${bareName.length} chars; Oracle 11g/12.1 limit is 30. Output is left unchanged — rename in Postgres before migrating, or target Oracle 12.2+.`,
      location: `table ${bareName}`,
    });
  }

  // Trailing CREATE TABLE clauses (TABLESPACE, PARTITION BY, INHERITS, WITH (...))
  // are Postgres-specific or syntactically incompatible with Oracle's placement.
  // Per warn-never-rewrite: drop them from output and emit a high-severity warning
  // identifying exactly what was dropped.
  if (tail.length > 0) {
    report.add({
      severity: "high",
      category: "table option dropped",
      message: `CREATE TABLE \`${bareName}\` had trailing clause \`${tail.replace(/\s+/g, " ").slice(0, 120)}\` after the column list. Postgres clauses such as INHERITS, PARTITION BY, TABLESPACE, and WITH (...) do not translate to Oracle; clause dropped from output — rewrite manually if needed.`,
      location: `table ${bareName}`,
    });
  }

  // Split body by top-level commas (respect parens)
  const parts = splitTopLevelCommas(body);
  const translatedParts: string[] = [];

  for (const raw of parts) {
    const part = raw.trim();
    if (part.length === 0) continue;

    // Constraint clauses: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, CONSTRAINT, EXCLUDE
    if (/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|EXCLUDE)\b/i.test(part)) {
      translatedParts.push("  " + translateConstraint(part, bareName, report));
      continue;
    }

    // Column definition: <name> <type> [modifiers...]
    const colMatch = part.match(/^("?[\w]+"?)\s+([\s\S]+)$/);
    if (!colMatch) {
      translatedParts.push("  " + part);
      continue;
    }
    const [, colNameRaw, rest] = colMatch;
    if (!colNameRaw || !rest) {
      translatedParts.push("  " + part);
      continue;
    }
    const colName = colNameRaw.replace(/"/g, "");
    if (colName.length > ORACLE_ID_LIMIT) {
      report.add({
        severity: "high",
        category: "long identifier",
        message: `Column name \`${colName}\` is ${colName.length} chars; exceeds Oracle 30-char limit. Output unchanged.`,
        location: `table ${bareName}, column ${colName}`,
      });
    }

    translatedParts.push("  " + translateColumnDef(colNameRaw, rest, bareName, report));
  }

  return `${prefix}${head}${rawName} (\n${translatedParts.join(",\n")}\n);`;
}

function splitTopLevelCommas(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  let inSingle = false;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    const next = i + 1 < s.length ? s[i + 1] : "";
    if (inLineComment) {
      buf += c;
      if (c === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      buf += c;
      if (c === "*" && next === "/") { buf += next; i++; inBlockComment = false; }
      continue;
    }
    if (inSingle) {
      buf += c;
      if (c === "'" && s[i + 1] !== "'") inSingle = false;
      else if (c === "'" && s[i + 1] === "'") { buf += s[++i]; }
      continue;
    }
    if (c === "-" && next === "-") { buf += c; inLineComment = true; continue; }
    if (c === "/" && next === "*") { buf += c + next; i++; inBlockComment = true; continue; }
    if (c === "'") { inSingle = true; buf += c; continue; }
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (c === "," && depth === 0) {
      out.push(buf);
      buf = "";
      continue;
    }
    buf += c;
  }
  if (buf.trim().length > 0) out.push(buf);
  return out;
}

function translateColumnDef(colNameRaw: string, rest: string, tableName: string, report: Report): string {
  // Tokenize the type name. A Postgres type name is one of:
  //   - a single word: integer, text, jsonb, varchar
  //   - a multi-word base: "double precision", "character varying", "timestamp without time zone", "timestamp with time zone"
  //   - optionally followed by parameters: varchar(255), numeric(10,2), timestamptz(3)
  // We try multi-word forms first (longest match), then a single-word fallback.
  const multiWord = [
    "timestamp without time zone",
    "timestamp with time zone",
    "character varying",
    "double precision",
  ];
  let pgType = "";
  let modifiers = "";
  const restLower = rest.toLowerCase();
  for (const mw of multiWord) {
    if (restLower.startsWith(mw)) {
      // capture optional (params)
      const after = rest.slice(mw.length);
      const paren = after.match(/^\s*\(([^)]*)\)/);
      if (paren) {
        pgType = `${rest.slice(0, mw.length)}(${paren[1]})`;
        modifiers = after.slice(paren[0].length).trim();
      } else {
        pgType = rest.slice(0, mw.length);
        modifiers = after.trim();
      }
      break;
    }
  }
  if (!pgType) {
    // Detect array types FIRST so we can warn instead of silently emitting
    // garbage like `CLOB []`. Postgres `text[]` has no Oracle equivalent.
    const arr = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)(\s*\([^)]*\))?\s*((?:\[\s*\]\s*)+)(.*)$/s);
    if (arr) {
      const [, base, paren, brackets, mods] = arr;
      const arrType = `${base}${paren ?? ""}${(brackets ?? "").replace(/\s+/g, "")}`;
      report.add({
        severity: "high",
        category: "array type",
        message: `Postgres array type \`${arrType}\` has no direct Oracle equivalent. Output left unchanged — model as a child table, a VARRAY/Nested Table type, or store as JSON CLOB before migrating.`,
        location: `table ${tableName}, column ${colNameRaw.replace(/"/g, "")}`,
      });
      const tail = (mods ?? "").trim();
      return `${colNameRaw} ${arrType}${tail ? " " + tail : ""}`.trim();
    }
    const single = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)(\s*\([^)]*\))?\s*(.*)$/s);
    if (!single) return `${colNameRaw} ${rest}`;
    const [, base, paren, mods] = single;
    if (!base) return `${colNameRaw} ${rest}`;
    pgType = `${base}${paren ?? ""}`;
    modifiers = (mods ?? "").trim();
  }

  const colName = colNameRaw.replace(/"/g, "");
  // Pass the RAW column token (preserving quotes) so __COL__ substitution
  // emits a syntactically valid Oracle identifier even for special-char
  // or case-sensitive names like "user-data".
  const mapped: MapResult | null = mapType(pgType, colNameRaw);

  let oracleType: string;
  if (mapped) {
    oracleType = mapped.oracle;
    if (mapped.warn) {
      report.add({
        severity: mapped.severity ?? "warn",
        category: "type mapping",
        message: mapped.warn,
        location: `table ${tableName}, column ${colName}`,
      });
    }
    // Length validation against Oracle limits (warn-never-rewrite policy).
    validateOracleLengths(pgType, oracleType, tableName, colName, report);
  } else {
    report.add({
      severity: "high",
      category: "unknown type",
      message: `No Oracle mapping for Postgres type \`${pgType}\`. Output left as-is — Oracle will reject it.`,
      location: `table ${tableName}, column ${colName}`,
    });
    oracleType = pgType;
  }

  // Translate modifiers (DEFAULT, NOT NULL, etc.)
  const translatedModifiers = translateColumnModifiers(modifiers, tableName, colName, pgType, report);

  // Special case: serial/bigserial collapse default+identity
  const isSerial = /^(big)?serial\b/i.test(pgType);
  if (isSerial) {
    // Strip any DEFAULT nextval(...) the user might have written manually
    const cleaned = translatedModifiers.replace(/DEFAULT\s+nextval\([^)]*\)\s*/i, "").trim();
    return `${colNameRaw} ${oracleType}${cleaned ? " " + cleaned : ""}`.trim();
  }

  return `${colNameRaw} ${oracleType}${translatedModifiers ? " " + translatedModifiers : ""}`.trim();
}

function translateColumnModifiers(mods: string, tableName: string, colName: string, pgType: string, report: Report): string {
  if (!mods) return "";
  let out = mods;

  // boolean defaults: true → 1, false → 0
  if (/^bool/i.test(pgType)) {
    out = out.replace(/DEFAULT\s+TRUE\b/gi, "DEFAULT 1");
    out = out.replace(/DEFAULT\s+FALSE\b/gi, "DEFAULT 0");
  }

  // now() / CURRENT_TIMESTAMP — Oracle has SYSTIMESTAMP, both work
  out = out.replace(/DEFAULT\s+now\(\)/gi, "DEFAULT SYSTIMESTAMP");

  // gen_random_uuid() / uuid_generate_v4() — no Oracle equivalent before 21c
  if (/DEFAULT\s+(gen_random_uuid|uuid_generate_v4)\s*\(\s*\)/i.test(out)) {
    report.add({
      severity: "high",
      category: "default expression dropped",
      message: `DEFAULT \`gen_random_uuid()\` has no Oracle equivalent before 21c. Default removed from output — application must supply UUIDs on insert, or add a BEFORE INSERT trigger using SYS_GUID().`,
      location: `table ${tableName}, column ${colName}`,
    });
    out = out.replace(/DEFAULT\s+(gen_random_uuid|uuid_generate_v4)\s*\(\s*\)\s*/gi, "");
  }

  // CURRENT_DATE, CURRENT_TIMESTAMP work in both
  // Drop USING clauses (Postgres-only)
  out = out.replace(/\s+USING\s+[^,]+/gi, "");

  // REFERENCES with ON DELETE CASCADE etc work in Oracle, leave them
  return out.trim();
}

/**
 * Validate that Oracle-side length/precision parameters fit Oracle's hard limits.
 * varchar2: 4000 bytes by default (32767 only with MAX_STRING_SIZE=EXTENDED).
 * NUMBER precision: max 38.
 * We never clamp; we warn so the user keeps the source-of-truth choice.
 */
function validateOracleLengths(pgType: string, oracleType: string, tableName: string, colName: string, report: Report): void {
  const vc = oracleType.match(/^VARCHAR2\((\d+)(?:\s+(?:BYTE|CHAR))?\)$/i);
  if (vc) {
    const n = Number(vc[1]);
    if (n > 4000) {
      report.add({
        severity: "high",
        category: "length out of range",
        message: `\`${pgType}\` → \`${oracleType}\` exceeds Oracle's default 4000-byte VARCHAR2 limit. Requires MAX_STRING_SIZE=EXTENDED (12.1+, irreversible) or migrate to CLOB.`,
        location: `table ${tableName}, column ${colName}`,
      });
    }
  }
  const num = oracleType.match(/^NUMBER\((\d+)(?:\s*,\s*(-?\d+))?\)$/i);
  if (num) {
    const p = Number(num[1]);
    if (p > 38) {
      report.add({
        severity: "high",
        category: "precision out of range",
        message: `\`${pgType}\` → \`${oracleType}\` exceeds Oracle's NUMBER precision limit of 38. Output left unchanged — Oracle will reject it.`,
        location: `table ${tableName}, column ${colName}`,
      });
    }
  }
}

function translateConstraint(part: string, tableName: string, report: Report): string {
  // Most table constraints translate verbatim. Watch for:
  //  - DEFERRABLE INITIALLY DEFERRED on UNIQUE — Oracle supports it
  //  - INCLUDE (...) on PRIMARY KEY — Postgres-only, drop with warning
  //  - EXCLUDE — Postgres-only, no Oracle equivalent
  let out = part;
  if (/^\s*(?:CONSTRAINT\s+\S+\s+)?EXCLUDE\b/i.test(out)) {
    report.add({
      severity: "high",
      category: "EXCLUDE constraint",
      message: `EXCLUDE constraint has no Oracle equivalent. Output left unchanged — Oracle will reject it. Consider an application-level check or a row-level trigger.`,
      location: `table ${tableName}`,
    });
    return out;
  }
  if (/INCLUDE\s*\(/i.test(out)) {
    report.add({
      severity: "warn",
      category: "constraint feature dropped",
      message: `INCLUDE clause on constraint is Postgres-only. Removed from output.`,
      location: `table ${tableName}`,
    });
    out = out.replace(/\s+INCLUDE\s*\([^)]*\)/gi, "");
  }
  return out;
}

function translateCreateIndex(stmt: string, report: Report): string {
  // CREATE [UNIQUE] INDEX [IF NOT EXISTS] <name> ON <table> [USING <method>] (cols) [INCLUDE (...)] [WHERE ...];
  let out = stmt;
  // USING btree/hash/gin/gist — Oracle has its own index types, drop USING for btree (default)
  out = out.replace(/\s+USING\s+btree\b/gi, "");
  if (/\s+USING\s+(gin|gist|hash|brin|spgist)\b/i.test(stmt)) {
    const m = stmt.match(/\s+USING\s+(gin|gist|hash|brin|spgist)\b/i);
    report.add({
      severity: "high",
      category: "index method",
      message: `Index uses Postgres-specific access method \`${m?.[1]}\`. Oracle has no direct equivalent; consider a function-based index or Oracle Text. USING clause dropped.`,
    });
    out = out.replace(/\s+USING\s+(gin|gist|hash|brin|spgist)\b/gi, "");
  }
  // IF NOT EXISTS — Oracle 12.2+ does NOT support this on CREATE INDEX
  if (/IF\s+NOT\s+EXISTS/i.test(out)) {
    report.add({
      severity: "warn",
      category: "DDL feature",
      message: `\`IF NOT EXISTS\` on CREATE INDEX is not portable. Removed; Oracle will error if the index already exists.`,
    });
    out = out.replace(/\s+IF\s+NOT\s+EXISTS/gi, "");
  }
  // INCLUDE (...) — Postgres-only on CREATE INDEX (covering indexes)
  if (/\bINCLUDE\s*\(/i.test(out)) {
    report.add({
      severity: "high",
      category: "index feature dropped",
      message: `\`INCLUDE (...)\` covering-index clause is Postgres-only. Removed from output — for similar effect on Oracle, add the columns to the index key list.`,
    });
    out = out.replace(/\s+INCLUDE\s*\([^)]*\)/gi, "");
  }
  // Partial-index WHERE — Oracle supports function-based indexes but not WHERE on plain indexes
  if (/\)\s*WHERE\s+/i.test(out)) {
    report.add({
      severity: "high",
      category: "partial index",
      message: `Partial index \`WHERE\` clause is Postgres-only. Output left unchanged — Oracle will reject it. Rewrite as a function-based index or materialized view.`,
    });
  }
  return out;
}

/**
 * Translate a full Postgres DDL file to Oracle DDL.
 */
export function translate(sql: string, sourceName = "input"): TranslateResult {
  const report = new Report();
  const statements = splitStatements(sql);
  const out: string[] = [];

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (trimmed.length === 0) {
      out.push(stmt);
      continue;
    }
    // Strip leading SQL comments + whitespace to classify the statement.
    // Comments themselves stay in the output (translateCreateTable preserves them).
    const classifier = trimmed
      .replace(/^(?:--[^\n]*\n|\/\*[\s\S]*?\*\/|\s)+/g, "")
      .trimStart();

    // Classify against the comment-stripped form so leading `-- ...` lines
    // don't hide the actual statement type from the dispatcher.
    // Skip / pass-through Postgres-only statements
    if (/^SET\s+/i.test(classifier) || /^SELECT\s+pg_catalog/i.test(classifier)) {
      report.add({
        severity: "info",
        category: "skipped",
        message: `Postgres-specific statement skipped: \`${classifier.slice(0, 60).replace(/\s+/g, " ")}…\``,
      });
      continue;
    }

    if (/^CREATE\s+TABLE\b/i.test(classifier)) {
      out.push(translateCreateTable(stmt, report));
      continue;
    }
    if (/^CREATE\s+(UNIQUE\s+)?INDEX\b/i.test(classifier)) {
      out.push(translateCreateIndex(stmt, report));
      continue;
    }
    if (/^COMMENT\s+ON\b/i.test(classifier)) {
      // COMMENT ON TABLE/COLUMN works identically in Oracle — pass through
      out.push(stmt);
      continue;
    }
    if (/^CREATE\s+EXTENSION\b/i.test(classifier)) {
      report.add({
        severity: "high",
        category: "extension",
        message: `\`CREATE EXTENSION\` is Postgres-only. Statement dropped — find Oracle equivalents (e.g. uuid-ossp → SYS_GUID, pgcrypto → DBMS_CRYPTO).`,
      });
      continue;
    }
    if (/^CREATE\s+(OR\s+REPLACE\s+)?(FUNCTION|PROCEDURE|TRIGGER)\b/i.test(classifier)) {
      report.add({
        severity: "high",
        category: "PL/pgSQL not translated",
        message: `pg2ora does not translate PL/pgSQL function/procedure/trigger bodies. Statement preserved verbatim — rewrite manually as PL/SQL.`,
      });
      out.push(stmt);
      continue;
    }
    if (/^ALTER\s+TABLE\b/i.test(classifier)) {
      // Many ALTER TABLE clauses translate cleanly; a few don't
      let altered = stmt;
      altered = altered.replace(/\bSET\s+DATA\s+TYPE\b/gi, "MODIFY");
      out.push(altered);
      continue;
    }

    out.push(stmt);
  }

  return {
    oracle: out.join(""),
    report,
  };
}
