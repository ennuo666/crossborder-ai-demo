import { listingPolicy } from "@/lib/listing-policy";
export const LISTING_CONSTRAINTS = { ...listingPolicy, bulletCount: 5 } as const;
