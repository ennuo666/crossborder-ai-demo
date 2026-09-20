import test from "node:test";
import assert from "node:assert/strict";
import { createListingAiAdapter } from "@/adapters/ai/listing-adapter";
import type { AiProvider } from "@/ai/types";
test("listing adapter forwards saved research and records usage metadata",async()=>{let user=""; const provider:AiProvider={name:"fake",model:"test-model",async completeJson(request){user=request.user; return {data:{title:"Research based listing",titleZh:"研究参考文案",bulletPoints:Array(5).fill("Fast"),bulletPointsZh:Array(5).fill("便捷"),description:"Description",descriptionZh:"商品描述",keywords:["charger"]},usage:{inputTokens:10,outputTokens:20,totalTokens:30}};}}; const result=await createListingAiAdapter(provider).generateListing({productName:"wireless charger",research:{competitorCount:4,priceRange:"$20 — $40"}}); assert.equal(result.state,"succeeded"); assert.match(user,/competitorCount/); assert.equal(result.usage?.totalTokens,30); assert.equal(result.usage?.model,"test-model");});
