import type { AiProviderName } from "./types";
export type AiConfig = { provider: AiProviderName; apiKey?: string; model: string; baseUrl: string };
export function getAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig { const apiKey=env.AI_API_KEY||env.OPENAI_API_KEY||undefined; return { provider:(env.AI_PROVIDER as AiProviderName|undefined)??(apiKey?"openai-compatible":"mock"), apiKey, model:env.AI_MODEL??"gpt-4o-mini", baseUrl:env.AI_BASE_URL??"https://api.openai.com/v1" }; }
