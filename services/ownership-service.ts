import type { RepositoryBundle } from "@/repositories/types";

export class ResourceNotFound extends Error {
  constructor() { super("Resource not found"); }
}

export function forUser(userId: string, repositories: RepositoryBundle) {
  if (!userId) throw new ResourceNotFound();
  const product = async (id: string) => {
    const result = await repositories.products.findForUser(id, userId);
    if (!result) throw new ResourceNotFound();
    return result;
  };
  return {
    product,
    list: () => repositories.products.listForUser(userId),
    async task(id: string) {
      const result = await repositories.tasks.findForUser(id, userId);
      if (!result) throw new ResourceNotFound();
      return result;
    },
    async detail(id: string) {
      const owned = await product(id);
      const [listing, research, assets, seoAudit, tasks] = await Promise.all([
        repositories.listings.latestByProduct(id), repositories.research.latestByProduct(id),
        repositories.assets.listByProduct(id), repositories.seoAudits.latestByProduct(id),
        repositories.tasks.listByProduct(id),
      ]);
      return { product: owned, listing, research, assets, seoAudit, tasks };
    },
  };
}
