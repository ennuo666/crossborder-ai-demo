import { mockMarketplaceProvider } from "./providers/mock-marketplace-provider";
import { AmazonApiProvider } from "./providers/amazon-api-provider";
import type { MarketplaceProvider } from "./types";
export function getMarketplaceProvider(): MarketplaceProvider { const key=process.env.AMAZON_RESEARCH_API_KEY; return process.env.MARKETPLACE_PROVIDER === "amazon-api" && key ? new AmazonApiProvider(key) : mockMarketplaceProvider; }
