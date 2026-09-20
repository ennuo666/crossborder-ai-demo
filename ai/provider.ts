import type { AiProvider } from "./types";
import { getAiConfig } from "./provider-config";
import { MockAiProvider } from "./providers/mock-provider";
import { OpenAICompatibleProvider } from "./providers/openai-compatible-provider";
export function getAiProvider(): AiProvider {
  const config = getAiConfig();
  if (process.env.NODE_ENV === "production" && !process.env.AI_PROVIDER) throw new Error("AI_PROVIDER_REQUIRED");
  if (config.provider === "mock") return new MockAiProvider();
  if (config.provider !== "openai-compatible" || !config.apiKey) throw new Error("AI_CONFIGURATION_INVALID");
  return new OpenAICompatibleProvider(config);
}
