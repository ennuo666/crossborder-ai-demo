import { z } from "zod";
const strings = z.array(z.string().min(1)).min(1);
export const researchAnalysisSchema = z.object({ coreSellingPoints: strings, userPainPoints: strings, targetUsers: strings, competitorDifferentiators: strings, recommendedKeywords: strings, risks: z.array(z.string().min(1)), competitorCount: z.number().int().nonnegative().default(0), coverage: z.string().default(""), priceRange: z.string().default(""), opportunities: z.array(z.string()).default([]) });
export const listingGenerationSchema = z.object({ title: z.string().min(1).max(200), bulletPoints: z.array(z.string().min(1)).min(1).max(7), description: z.string().min(1), keywords: strings });
export type ResearchAnalysis = z.infer<typeof researchAnalysisSchema>;
export type ListingGeneration = z.infer<typeof listingGenerationSchema>;
