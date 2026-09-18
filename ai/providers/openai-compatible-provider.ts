import type { AiCompletionRequest, AiProvider } from "../types";
import type { AiConfig } from "../provider-config";
export class OpenAICompatibleProvider implements AiProvider {
  readonly name = "openai-compatible" as const;
  constructor(private readonly config: AiConfig) {}
  async completeJson(request: AiCompletionRequest): Promise<unknown> {
    if (!this.config.apiKey) throw new Error("AI_API_KEY_MISSING");
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`, { method:"POST", headers:{"content-type":"application/json", authorization:`Bearer ${this.config.apiKey}`}, body:JSON.stringify({model:this.config.model,response_format:{type:"json_object"},messages:[{role:"system",content:request.system},{role:"user",content:request.user}]}) });
    if (!response.ok) throw new Error(`AI_PROVIDER_HTTP_${response.status}`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content; if (!content) throw new Error("AI_PROVIDER_EMPTY_RESPONSE");
    try { return JSON.parse(content); } catch { throw new Error("AI_PROVIDER_INVALID_JSON"); }
  }
}
