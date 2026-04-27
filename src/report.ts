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

export class Report {
  private warnings: Warning[] = [];
  private notes: string[] = [];

  add(w: Warning): void {
    this.warnings.push(w);
  }

  note(s: string): void {
    this.notes.push(s);
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
    lines.push("");

    if (this.warnings.length === 0) {
      lines.push("✅ No compatibility issues detected. Translation is clean.");
    } else {
      const high = this.warnings.filter((w) => w.severity === "high");
      const warn = this.warnings.filter((w) => w.severity === "warn");
      const info = this.warnings.filter((w) => w.severity === "info");

      lines.push(`## Summary`);
      lines.push("");
      lines.push(`- **High severity:** ${high.length} (these will likely break on Oracle)`);
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

    if (this.notes.length > 0) {
      lines.push(`## Notes`);
      lines.push("");
      for (const n of this.notes) lines.push(`- ${n}`);
      lines.push("");
    }

    lines.push(`---`);
    lines.push(`pg2oracle translates types; it never renames your objects.`);
    lines.push("");
    return lines.join("\n");
  }
}
