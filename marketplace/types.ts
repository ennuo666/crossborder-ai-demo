import { z } from "zod";
export const competitorProductSchema = z.object({ externalId:z.string().min(1), marketplace:z.string().min(1), title:z.string().default(""), brand:z.string().default(""), price:z.number().nonnegative().nullable(), currency:z.string().default("USD"), rating:z.number().min(0).max(5).nullable(), reviewCount:z.number().int().nonnegative().nullable(), imageUrl:z.string().url().nullable(), productUrl:z.string().url().nullable(), features:z.array(z.string()), availability:z.string().default("unknown"), fetchedAt:z.string().datetime(), sponsored:z.boolean().default(false), description:z.string().default(""), manufacturer:z.string().default("") });
export type CompetitorProduct = z.infer<typeof competitorProductSchema>;
export type MarketplaceQuery = { query:string; marketplace?:string; limit?:number };
export type MarketplaceProviderResult = { products: CompetitorProduct[]; marketplace:string; query:string; fetchedAt:string };
export interface MarketplaceProvider { readonly name:string; search(input:MarketplaceQuery): Promise<MarketplaceProviderResult>; }
