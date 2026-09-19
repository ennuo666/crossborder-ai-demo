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
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } };
    const content = payload.choices?.[0]?.message?.content ?? payload.choices?.[0]?.message?.reasoning_content; if (!content) throw new Error("AI_PROVIDER_EMPTY_RESPONSE");
    try { const cleaned=content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""); const start=cleaned.indexOf("{"); const end=cleaned.lastIndexOf("}"); const jsonText=start>=0&&end>start?cleaned.slice(start,end+1):cleaned; return { data:JSON.parse(jsonText), usage:{inputTokens:payload.usage?.prompt_tokens,outputTokens:payload.usage?.completion_tokens,totalTokens:payload.usage?.total_tokens} }; } catch { const finish=payload.choices?.[0] ? (payload.choices[0] as {finish_reason?:string}).finish_reason : "unknown"; throw new Error(`AI_PROVIDER_INVALID_JSON:${finish}:${content.length}`); }
  }
}




