import { mockMarketplaceProvider } from "./providers/mock-marketplace-provider";
import { AmazonApiProvider } from "./providers/amazon-api-provider";
import type { MarketplaceProvider } from "./types";
import { SerpApiAmazonProvider, SerpApiProviderError } from "./providers/serpapi-amazon-provider";
export function getMarketplaceProvider(): MarketplaceProvider { const provider=process.env.MARKETPLACE_PROVIDER??"mock"; if(provider === "serpapi"){ if(!process.env.SERPAPI_API_KEY) throw new SerpApiProviderError("INVALID_CONFIGURATION","SERPAPI_API_KEY is required when MARKETPLACE_PROVIDER=serpapi"); return new SerpApiAmazonProvider(process.env.SERPAPI_API_KEY); } return provider === "amazon-api" && process.env.AMAZON_RESEARCH_API_KEY ? new AmazonApiProvider(process.env.AMAZON_RESEARCH_API_KEY) : mockMarketplaceProvider; }
