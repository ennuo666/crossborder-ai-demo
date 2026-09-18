import { getAiProvider } from "@/ai/provider";
import { createResearchAiAdapter } from "./research-adapter";
import { createListingAiAdapter } from "./listing-adapter";
export const getResearchAdapter=()=>createResearchAiAdapter(getAiProvider());
export const getListingAdapter=()=>createListingAiAdapter(getAiProvider());
