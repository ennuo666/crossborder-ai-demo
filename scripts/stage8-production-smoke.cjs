const { loadEnvConfig } = require("@next/env");
const { spawn, spawnSync } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const { once } = require("node:events");
loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL || process.env.RUN_DB_INTEGRATION !== "1") throw new Error("Set DATABASE_URL and RUN_DB_INTEGRATION=1");
  const url = new URL(process.env.DATABASE_URL);
  const name = `market_stage8_${Date.now()}`;
  const psqlEnv = { ...process.env, PGHOST: url.hostname, PGPORT: url.port || "5432", PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: "postgres" };
  const psql = process.env.PSQL_PATH || "psql";
  const created = spawnSync(psql, ["-X", "-v", "ON_ERROR_STOP=1", "-c", `CREATE DATABASE ${name}`], { env: psqlEnv, encoding: "utf8" });
  if (created.status !== 0) throw new Error("Isolated database creation failed; check PSQL_PATH and database permissions");
  url.pathname = "/" + name;
  const port = process.env.STAGE8_PORT || "3108";
  const base = `http://localhost:${port}`;
  const env = { ...process.env, DATABASE_URL: url.toString(), NODE_ENV: "production", REPOSITORY_MODE: "prisma", AI_PROVIDER: "mock", MARKETPLACE_PROVIDER: "mock", BETTER_AUTH_SECRET: randomBytes(48).toString("hex"), BETTER_AUTH_URL: base, STAGE8_BASE_URL: base, RUN_STAGE8_INTEGRATION: "1", RUN_DB_INTEGRATION: "1" };
  const migration = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env, encoding: "utf8" });
  if (migration.status !== 0) throw new Error("Fresh database migration failed (provider output withheld)");
  console.info(JSON.stringify({ emptyDatabase: name, migrationDeploy: "passed" }));
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", port], { env, stdio: ["ignore", "ignore", "ignore"] });
  try {
    let ready = false;
    for (let count = 0; count < 100; count++) {
      try { ready = (await fetch(base + "/api/health")).ok; } catch {}
      if (ready) break;
      if (server.exitCode !== null) throw new Error("Production server exited during startup");
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    if (!ready) throw new Error("Production health check timed out");
    const test = spawn(process.execPath, ["node_modules/tsx/dist/cli.mjs", "--test", "tests/stage8-http.integration.test.ts"], { env, stdio: "inherit" });
    const [code] = await once(test, "exit");
    if (code !== 0) throw new Error("Production integration failed");
  } finally {
    server.kill();
    if (server.exitCode === null) await once(server, "exit");
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
