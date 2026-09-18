import { products } from "@/lib/mock-data";
import type { Product } from "@/lib/types";

export function listProducts(): Product[] { return products; }
export function createMockProduct(name: string, market = "美国", channel = "Amazon US"): Product {
  return { id: `mock-${Date.now()}`, name, subtitle: "New product workspace", market, channel, status: "待研究", progress: 0, updatedAt: "刚刚" };
}
