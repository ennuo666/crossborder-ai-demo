import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createPrismaRepositories } from "@/repositories/prisma-repository";
import { createTask } from "@/services/task-service";
test("PostgreSQL persistence and reload", { skip: !(process.env.DATABASE_URL && process.env.RUN_DB_INTEGRATION === "1") }, async()=>{const client=new PrismaClient(); const repos=createPrismaRepositories(client); const product=await repos.products.create({name:`db-test-${Date.now()}`,market:"US",channel:"Amazon"}); const task=await createTask(product.id,"RESEARCH",undefined,repos); const fresh=createPrismaRepositories(new PrismaClient()); const loaded=await fresh.products.findById(product.id); const taskLoaded=await fresh.tasks.findById(task.id); assert.equal(loaded?.id,product.id); assert.equal(taskLoaded?.status,"queued"); await client.$disconnect();});
