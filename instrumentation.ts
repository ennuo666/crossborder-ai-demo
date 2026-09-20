export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  const { validateProductionConfig } = await import("@/lib/runtime-config");
  validateProductionConfig();
  const { bootstrapWorker } = await import("@/task-queue/in-process-queue");
  await bootstrapWorker();
}
