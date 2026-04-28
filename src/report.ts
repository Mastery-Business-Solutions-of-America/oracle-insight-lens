/**
 * Compatibility warning collector. The report IS the UX —
 * when pg2oracle can't translate something cleanly, this is what the user reads.
 */
import type { Severity } from "./map.js";

export interface Warning {
  severity: Severity;
  category: string;
  message: string;
  location?: string; // e.g. "table users, column email"
}

/**
 * License / edition signal observed in the source schema.
 *
 * These are FACTUAL observations about the Postgres schema and the Oracle
 * features that would be involved in a like-for-like landing zone. They are
 * NOT a licensing determination. Oracle licensing depends on contract terms,
 * deployment model (on-prem vs OCI vs ADB), edition, options purchased, and
 * usage patterns — none of which a DDL file can reveal.
 *
 * The wording is deliberately observational ("would involve …", "verify with
 * your Oracle account team") to keep this useful in M&A diligence and
 * solution-architect intake without crossing into legal advice.
 */
export interface LicenseSignal {
  // Stable key so callers can dedupe (one signal per feature category, not per occurrence)
  key: string;
  // Short observation, e.g. "Range partitioning detected"
  observation: string;
  // Oracle-side feature(s) involved, e.g. "Oracle Partitioning option"
  oracleFeature: string;
  // Concrete edition / option implication, written as a question/verification step
  implication: string;
  // Where it was seen (collected; reported as a count)
  locations: string[];
}

export class Report {
  private warnings: Warning[] = [];
  private notes: string[] = [];
  private licenseSignals: Map<string, LicenseSignal> = new Map();

  add(w: Warning): void {
    this.warnings.push(w);
  }

  note(s: string): void {
    this.notes.push(s);
  }

  /**
   * Record a license/edition signal. Multiple calls with the same `key` are
   * collapsed into one entry; only `locations` accumulates.
   */
  signal(s: Omit<LicenseSignal, "locations"> & { location?: string }): void {
    const existing = this.licenseSignals.get(s.key);
    if (existing) {
      if (s.location) existing.locations.push(s.location);
      return;
    }
    this.licenseSignals.set(s.key, {
      key: s.key,
      observation: s.observation,
      oracleFeature: s.oracleFeature,
      implication: s.implication,
      locations: s.location ? [s.location] : [],
    });
  }

  hasHigh(): boolean {
    return this.warnings.some((w) => w.severity === "high");
  }

  hasAnyWarning(): boolean {
    return this.warnings.some((w) => w.severity === "warn" || w.severity === "high");
  }

  count(): number {
    return this.warnings.length;
  }

  toMarkdown(inputName: string): string {
    const lines: string[] = [];
    lines.push(`# pg2oracle compatibility report`);
    lines.push("");
    lines.push(`Source: \`${inputName}\``);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Target: Oracle Database 19c / 21c+ (default landing zone)`);
    lines.push("");

    if (this.warnings.length === 0) {
      lines.push("✅ No compatibility issues detected. Translation is clean.");
    } else {
      const high = this.warnings.filter((w) => w.severity === "high");
      const warn = this.warnings.filter((w) => w.severity === "warn");
      const info = this.warnings.filter((w) => w.severity === "info");

      lines.push(`## Summary`);
      lines.push("");
      lines.push(`- **High severity:** ${high.length} (will likely break on Oracle)`);
      lines.push(`- **Warnings:** ${warn.length} (lossy or behavior change)`);
      lines.push(`- **Info:** ${info.length}`);
      lines.push("");

      const renderGroup = (title: string, ws: Warning[]) => {
        if (ws.length === 0) return;
        lines.push(`## ${title}`);
        lines.push("");
        for (const w of ws) {
          const loc = w.location ? ` _(${w.location})_` : "";
          lines.push(`- **[${w.category}]**${loc} ${w.message}`);
        }
        lines.push("");
      };

      renderGroup("High severity", high);
      renderGroup("Warnings", warn);
      renderGroup("Info", info);
    }

    // ── License & edition signals ───────────────────────────────────────
    // Always render the section so the disclaimer is on every report,
    // even when no signals fired. M&A and pre-sales readers expect to
    // see this header at a known location.
    lines.push(`## Oracle edition & option signals`);
    lines.push("");
    lines.push(
      `> Observational only. Schema features below would, on a like-for-like Oracle landing zone, involve the listed Oracle Database editions or options. Final licensing depends on your Oracle contract, deployment model (on-prem, OCI, ADB), and actual usage — verify with your Oracle account team or License Management Services. \`pg2oracle\` is not affiliated with Oracle Corporation and does not provide licensing advice.`,
    );
    lines.push("");

    if (this.licenseSignals.size === 0) {
      lines.push(
        `No edition-specific Oracle features triggered by this schema. A Standard Edition 2 (SE2) landing zone is plausible from a DDL standpoint — verify against workload, HA, and tooling requirements (RAC, partitioning, advanced security, GoldenGate, etc.) before sizing.`,
      );
      lines.push("");
    } else {
      lines.push(`| Signal | Oracle feature involved | Verification |`);
      lines.push(`| --- | --- | --- |`);
      for (const s of this.licenseSignals.values()) {
        const count = s.locations.length;
        const obs = count > 0 ? `${s.observation} _(×${count})_` : s.observation;
        lines.push(
          `| ${obs} | ${s.oracleFeature} | ${s.implication} |`,
        );
      }
      lines.push("");
    }

    if (this.notes.length > 0) {
      lines.push(`## Notes`);
      lines.push("");
      for (const n of this.notes) lines.push(`- ${n}`);
      lines.push("");
    }

    lines.push(`---`);
    lines.push(`pg2oracle translates types; it never renames your objects.`);
    lines.push(`Report format: observation → Oracle implication → verify. No licensing advice.`);
    lines.push("");
    return lines.join("\n");
  }
}
