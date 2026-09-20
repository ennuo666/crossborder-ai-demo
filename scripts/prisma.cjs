const { loadEnvConfig } = require("@next/env");
const { spawnSync } = require("node:child_process");
loadEnvConfig(process.cwd());
const result = spawnSync(process.execPath, [require.resolve("prisma/build/index.js"), ...process.argv.slice(2)], { env: process.env, stdio: "inherit" });
process.exitCode = result.status ?? 1;
