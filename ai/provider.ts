import type { AiProvider } from "./types";
import { getAiConfig } from "./provider-config";
import { MockAiProvider } from "./providers/mock-provider";
import { OpenAICompatibleProvider } from "./providers/openai-compatible-provider";
export function getAiProvider(): AiProvider { const config=getAiConfig(); return config.provider === "openai-compatible" && config.apiKey ? new OpenAICompatibleProvider(config) : new MockAiProvider(); }
