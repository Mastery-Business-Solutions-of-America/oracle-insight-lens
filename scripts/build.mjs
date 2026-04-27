#!/usr/bin/env node
// Build script: bundles src/cli.ts → dist/cli.cjs and injects the package
// version at build time via esbuild --define. Keeps --version in sync with
// package.json without a runtime fs lookup that breaks once installed.
import { execSync } from "node:child_process";
import { readFileSync, chmodSync } from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const version = JSON.stringify(pkg.version); // wraps in quotes for --define

const cmd = [
  "esbuild src/cli.ts",
  "--bundle",
  "--platform=node",
  "--target=node22",
  "--format=cjs",
  "--outfile=dist/cli.cjs",
  '--banner:js="#!/usr/bin/env node"',
  `--define:__PG2ORACLE_VERSION__='${version}'`,
].join(" ");

execSync(cmd, { stdio: "inherit" });
chmodSync("dist/cli.cjs", 0o755);
console.log(`✓ built pg2oracle v${pkg.version} → dist/cli.cjs`);
