export type AiProviderName = "mock" | "openai-compatible" | "fake";
export type AiCompletionRequest = { system: string; user: string; responseSchemaName: string };
export interface AiProvider { readonly name: AiProviderName; completeJson(request: AiCompletionRequest): Promise<unknown>; }
