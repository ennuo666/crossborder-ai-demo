import type { AiCompletionRequest, AiProvider } from "../types";
import type { AiConfig } from "../provider-config";
export class OpenAICompatibleProvider implements AiProvider {
  readonly name = "openai-compatible" as const;
  readonly model: string;
  constructor(private readonly config: AiConfig) { this.model=config.model; }
  async completeJson(request: AiCompletionRequest): Promise<unknown> {
    if (!this.config.apiKey) throw new Error("AI_API_KEY_MISSING");
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`, { method:"POST", headers:{"content-type":"application/json", authorization:`Bearer ${this.config.apiKey}`}, body:JSON.stringify({model:this.config.model,response_format:{type:"json_object"},messages:[{role:"system",content:request.system},{role:"user",content:request.user}]}) });
    if (!response.ok) throw new Error(`AI_PROVIDER_HTTP_${response.status}`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } };
    const content = payload.choices?.[0]?.message?.content; if (!content) throw new Error("AI_PROVIDER_EMPTY_RESPONSE");
    try { return { data: JSON.parse(content), usage: { inputTokens:payload.usage?.prompt_tokens, outputTokens:payload.usage?.completion_tokens, totalTokens:payload.usage?.total_tokens } }; } catch { throw new Error("AI_PROVIDER_INVALID_JSON"); }
  }
}
