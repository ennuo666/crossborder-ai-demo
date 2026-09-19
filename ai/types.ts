export type AiProviderName = "mock" | "openai-compatible" | "fake";
export type AiCompletionRequest = { system: string; user: string; responseSchemaName: string };
export type AiUsage = { inputTokens?: number; outputTokens?: number; totalTokens?: number };
export type AiProviderResponse = { data: unknown; usage?: AiUsage };
export interface AiProvider { readonly name: AiProviderName; model?: string; completeJson(request: AiCompletionRequest): Promise<unknown | AiProviderResponse>; }
