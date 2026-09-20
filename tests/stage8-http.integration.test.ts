import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { createPrismaRepositories } from "@/repositories/prisma-repository";

test("production auth, IDOR and multi-user background persistence", {
  skip: !(process.env.RUN_STAGE8_INTEGRATION === "1" && process.env.RUN_DB_INTEGRATION === "1" && process.env.DATABASE_URL && process.env.STAGE8_BASE_URL),
}, async () => {
  const base = process.env.STAGE8_BASE_URL!;
  const client = new PrismaClient();
  const identities: string[] = [];
  const password = randomUUID() + "Aa9!";
  function browser() {
    let cookie = "";
    return async (path: string, body?: unknown) => {
      const response = await fetch(base + path, { method: body === undefined ? "GET" : "POST", redirect: "manual", headers: { origin: base, cookie, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) cookie = cookies.map(value => value.split(";")[0]).join("; ");
      return response;
    };
  }
  const a = browser(), b = browser(), guest = browser();
  try {
    assert.equal((await guest("/login")).status, 200);
    assert.equal((await guest("/api/health")).status, 200);
    assert.equal((await guest("/")).status, 307);
    assert.equal((await guest("/api/products")).status, 401);
    for (const [name, request] of [["A", a], ["B", b]] as const) {
      const email = `stage8-${randomUUID()}@example.test`; identities.push(email);
      assert.equal((await request("/api/auth/sign-up/email", { name, email, password })).status, 200);
      assert.deepEqual((await (await request("/api/products")).json()).products, []);
      assert.equal((await request("/api/auth/sign-out", {})).status, 200);
      assert.equal((await request("/api/products")).status, 401);
      assert.equal((await request("/api/auth/sign-in/email", { email, password })).status, 200);
      assert.ok((await (await request("/api/auth/get-session")).json()).user.id);
    }
    const pa = (await (await a("/api/products", { name: "wireless charger", userId: "spoofed-owner" })).json()).product;
    const pb = (await (await b("/api/products", { name: "B private product" })).json()).product;
    assert.notEqual(pa.userId, "spoofed-owner");
    assert.equal((await a(`/api/products/${pa.id}`)).status, 200);
    assert.equal((await b(`/api/products/${pb.id}`)).status, 200);
    assert.equal((await a(`/api/products/${pb.id}`)).status, 404);
    for (const path of [`/api/products/${pa.id}`, `/api/products/${pa.id}/tasks`, `/api/products/${pa.id}/listing`]) assert.equal((await b(path)).status, 404);
    assert.equal((await b(`/api/products/${pa.id}/tasks`, { type: "RESEARCH" })).status, 404);
    assert.equal((await b(`/api/products/${pa.id}/listing`, { title: "attack" })).status, 404);
    for (const type of ["RESEARCH", "LISTING_GENERATION"]) {
      const response = await a(`/api/products/${pa.id}/tasks`, { type });
      assert.equal(response.status, 202);
      const queued = await response.json(); assert.equal(queued.status, "queued");
      assert.equal((await b(`/api/tasks/${queued.taskId}`)).status, 404);
      let status = "queued";
      for (let attempt = 0; attempt < 100; attempt++) {
        const task = (await (await a(`/api/tasks/${queued.taskId}`)).json()).task;
        status = task.status;
        if (["succeeded", "failed"].includes(status)) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      assert.equal(status, "succeeded", `${type} background task`);
    }
    const detail = await (await a(`/api/products/${pa.id}`)).json();
    assert.equal(detail.research.productId, pa.id); assert.equal(detail.listing.productId, pa.id);
    const repos = createPrismaRepositories(client);
    await repos.assets.create({ productId: pa.id, taskId: null, kind: "image", name: "private asset", url: null, metadata: {}, status: "ready" });
    await repos.seoAudits.create({ productId: pa.id, taskId: null, score: 80, issueCount: 1, details: {}, status: "completed" });
    assert.equal((await b(`/api/products/${pa.id}`)).status, 404);
    const fresh = new PrismaClient();
    try {
      assert.equal(await fresh.researchResult.count({ where: { productId: pa.id } }), 1);
      assert.equal(await fresh.listing.count({ where: { productId: pa.id } }), 1);
      assert.equal(await fresh.asset.count({ where: { productId: pa.id } }), 1);
      assert.equal(await fresh.seoAudit.count({ where: { productId: pa.id } }), 1);
      assert.equal(await fresh.task.count({ where: { productId: pa.id, status: "succeeded" } }), 2);
      const account = await fresh.account.findFirst({ where: { userId: pa.userId } });
      assert.ok(account?.password); assert.notEqual(account.password, password);
    } finally { await fresh.$disconnect(); }
    assert.equal((await a("/api/auth/sign-out", {})).status, 200);
    assert.equal((await a(`/api/products/${pa.id}`)).status, 401);
    console.info(JSON.stringify({ stage8: "passed", users: 2, workerTasks: 2, researchPersisted: true, listingPersisted: true, reloadAfterNewRepository: true, idor: "404", logout: "passed" }));
  } finally {
    await client.user.deleteMany({ where: { email: { in: identities } } });
    await client.$disconnect();
  }
});
