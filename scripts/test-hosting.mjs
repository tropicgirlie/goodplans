import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawn } from "node:child_process";
const dir = await mkdtemp(join(tmpdir(), "good-plans-integration-"));
const config = join(dir, "wrangler.json");
const root = process.cwd(),
  cli = resolve("node_modules/wrangler/bin/wrangler.js");
await writeFile(
  config,
  JSON.stringify({
    name: "good-plans-integration",
    main: resolve("worker/src/index.js"),
    compatibility_date: "2026-08-19",
    assets: {
      directory: resolve("dist"),
      run_worker_first: ["/api/*", "/__scheduled"],
      not_found_handling: "single-page-application",
    },
    d1_databases: [
      {
        binding: "DB",
        database_name: "test-plans",
        database_id: "00000000-0000-0000-0000-000000000001",
        migrations_dir: resolve("worker/migrations"),
      },
    ],
    durable_objects: {
      bindings: [{ name: "EVENT_ROOM", class_name: "EventRoom" }],
    },
    migrations: [{ tag: "v1", new_sqlite_classes: ["EventRoom"] }],
    vars: { RESEND_WEBHOOK_SECRET: "whsec_dGVzdC1vbmx5LXdlYmhvb2stc2VjcmV0", ENVIRONMENT: "development", HOST_EMAILS: "tessa@example.com" },
    triggers: { crons: ["*/15 * * * *"] },
  }),
);
function run(args, env = {}) {
  return new Promise((res, rej) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (x) => (output += x));
    child.stderr.on("data", (x) => (output += x));
    child.on("exit", (code) =>
      code === 0 ? res(output) : rej(new Error(output)),
    );
  });
}
let worker,
  workerOutput = "";
try {
  await run([
    cli,
    "d1",
    "migrations",
    "apply",
    "test-plans",
    "--config",
    config,
    "--local",
    "--persist-to",
    join(dir, "state"),
  ]);
  worker = spawn(
    process.execPath,
    [
      cli,
      "dev",
      "--config",
      config,
      "--local",
      "--port",
      "8791",
      "--persist-to",
      join(dir, "state"),
      "--test-scheduled",
    ],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );
  worker.stdout.on("data", (x) => (workerOutput += x));
  worker.stderr.on("data", (x) => (workerOutput += x));
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch("http://127.0.0.1:8791/api/health");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!ready)
    throw new Error("Isolated Worker did not start.\n" + workerOutput);
  process.stdout.write(
    await run(["--test", "worker/tests/hosting.integration.test.mjs"], {
      TEST_API_URL: "http://127.0.0.1:8791",
    }),
  );
} catch (e) {
  console.error(e.message);
  console.error(workerOutput);
  process.exitCode = 1;
} finally {
  if (worker) {
    worker.kill("SIGTERM");
    await new Promise((r) => worker.once("exit", r));
  }
  await rm(dir, { recursive: true, force: true });
}
