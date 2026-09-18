import { getRepositories } from "@/repositories";
import type { RepositoryBundle, ProductCreateInput } from "@/repositories/types";
import { createTask } from "./task-service";

export async function listProducts(repositories: RepositoryBundle = getRepositories()) { return repositories.products.list(); }
export async function getProduct(id: string, repositories: RepositoryBundle = getRepositories()) { return repositories.products.findById(id); }
export async function createProduct(input: ProductCreateInput, repositories: RepositoryBundle = getRepositories()) {
  const product = await repositories.products.create({ ...input, name: input.name.trim() || "新商品项目" });
  const task = await createTask(product.id, "RESEARCH", { productName: product.name }, repositories);
  return { product, task };
}
