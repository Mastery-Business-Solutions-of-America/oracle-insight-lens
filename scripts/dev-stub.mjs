#!/usr/bin/env node
// pg2oracle is a Node CLI, not a web app. Some preview/hosting environments
// expect a dev server on a port — this stub satisfies the healthcheck and
// serves a simple HTML page explaining what the project actually is.
import { createServer } from "node:http";

// Accept --port N (passed by the host environment) or fall back to PORT env / 8080.
const args = process.argv.slice(2);
const portIdx = args.indexOf("--port");
const port = Number(
  (portIdx >= 0 ? args[portIdx + 1] : undefined) ?? process.env.PORT ?? 8080,
);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>pg2oracle — PostgreSQL → Oracle DDL translator</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 16px/1.6 ui-sans-serif, system-ui, sans-serif; max-width: 720px; margin: 4rem auto; padding: 0 1.5rem; }
  code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { background: #1115; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  h1 { margin-bottom: 0.25rem; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #2563eb22; color: #2563eb; font-size: 12px; font-weight: 600; }
</style>
</head>
<body>
  <span class="tag">CLI · v0.1.0</span>
  <h1>pg2oracle</h1>
  <p>Translate PostgreSQL DDL to Oracle DDL. File in, file out. Honest about what it can't do.</p>
  <p>This project is a command-line tool, not a web app — there is nothing interactive to render here.</p>
  <h2>Try it</h2>
  <pre><code>bun install
bun run build
node dist/cli.cjs --help
bun run test    # 28 unit tests
bun run uat     # 21-criteria acceptance script</code></pre>
  <p>See <code>README.md</code> for the full mapping table and design philosophy.</p>
</body>
</html>`;

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(port, () => {
  console.log(`pg2oracle dev stub listening on http://localhost:${port}`);
  console.log(`(this is just a placeholder — pg2oracle is a CLI, see README.md)`);
});
