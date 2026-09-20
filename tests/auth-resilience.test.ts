import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { POST } from "@/app/api/auth/form-unavailable/route";

test("unavailable auth form redirects without reflecting submitted credentials", async () => {
  const response = POST(new Request("http://localhost/api/auth/form-unavailable", {
    method: "POST", body: new URLSearchParams({ email: "test@example.test", password: "synthetic-only" }),
  }));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "http://localhost/login");
  assert.equal(await response.text(), "");
});

test("development and production use separate build directories", async () => {
    for (const [mode, expected] of [["development", ".next-dev"], ["production", ".next"]] as const) {
      // Evaluate config in a fresh module process to avoid the import cache.
      const { execFileSync } = await import("node:child_process");
      const output = execFileSync(process.execPath, ["--import", "tsx", "-e", "console.log(require('./next.config.ts').default.distDir)"], { encoding: "utf8", env: { ...process.env, NODE_ENV: mode } });
      assert.equal(output.trim(), expected);
    }
    assert.match(readFileSync(".gitignore", "utf8"), /\.next-dev\//);
});
