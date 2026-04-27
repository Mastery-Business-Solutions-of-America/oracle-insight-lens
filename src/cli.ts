// Built bundle gets a shebang via esbuild's --banner flag (see package.json).
import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { translate } from "./translate.js";

// Read version from package.json so --version never drifts from the published manifest.
// createRequire works in both ESM source (vitest) and the bundled CJS output (esbuild
// inlines the package.json contents at build time when --bundle is on).
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const program = new Command();

program
  .name("pg2oracle")
  .description("Translate PostgreSQL DDL to Oracle DDL. File in, file out.\nWarns about lossy mappings and footguns; never renames your objects.")
  .version(pkg.version)
  .argument("[input]", "Input SQL file (omit or use '-' to read stdin)")
  .option("-o, --output <file>", "Write Oracle DDL to file (default: stdout)")
  .option("--report <file>", "Write compatibility report (markdown)")
  .option("--strict", "Exit with code 2 if any warnings or high-severity issues found")
  .helpOption("-h, --help", "Show this help")
  .addHelpText(
    "after",
    `
Examples:
  pg2oracle schema.sql -o oracle.sql
  pg2oracle schema.sql -o oracle.sql --report compat.md
  pg_dump --schema-only mydb | pg2oracle > oracle.sql
  pg2oracle schema.sql --strict -o oracle.sql   # exit 2 on warnings (CI use)

Report severities:
  high  - will likely break on Oracle (jsonb operators, long identifiers, etc.)
  warn  - lossy or behavior change (boolean -> NUMBER(1), uuid -> RAW(16))
  info  - non-blocking notes (statements skipped, etc.)
`,
  );

program.parse(process.argv);
const opts = program.opts<{ output?: string; report?: string; strict?: boolean }>();
const inputArg = program.args[0];

async function readInput(): Promise<{ sql: string; sourceName: string }> {
  if (!inputArg || inputArg === "-") {
    // Read stdin
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    return { sql: Buffer.concat(chunks).toString("utf8"), sourceName: "<stdin>" };
  }
  try {
    const sql = readFileSync(inputArg, "utf8");
    return { sql, sourceName: inputArg };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`pg2oracle: cannot read input '${inputArg}': ${msg}\n`);
    process.exit(1);
  }
}

function writeOutput(path: string | undefined, content: string, label: string): void {
  if (!path) {
    process.stdout.write(content);
    return;
  }
  try {
    writeFileSync(path, content, "utf8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`pg2oracle: cannot write ${label} to '${path}': ${msg}\n`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const { sql, sourceName } = await readInput();
  // Normalize CRLF → LF so Windows-saved .sql files translate identically
  const normalized = sql.replace(/\r\n/g, "\n");

  const { oracle, report } = translate(normalized, sourceName);

  writeOutput(opts.output, oracle, "Oracle DDL");

  if (opts.report) {
    writeOutput(opts.report, report.toMarkdown(sourceName), "report");
  }

  // Surface a one-line summary on stderr unless we wrote to stdout
  if (opts.output) {
    const n = report.count();
    if (n > 0) {
      process.stderr.write(`pg2oracle: ${n} compatibility note(s)${opts.report ? ` written to ${opts.report}` : ""}\n`);
    } else {
      process.stderr.write(`pg2oracle: clean translation, no warnings\n`);
    }
  }

  if (opts.strict && report.hasAnyWarning()) {
    process.exit(2);
  }
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`pg2oracle: ${msg}\n`);
  process.exit(1);
});
