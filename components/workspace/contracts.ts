import type { ListingRecord, ProductRecord, ProductSummary, ResearchResultRecord, TaskRecord, TaskType, ViewKey } from "@/lib/types";
export type WorkspaceViewProps = {
  user: { name: string; email: string };
  products: ProductRecord[];
  summaries: ProductSummary[];
  recentTasks: TaskRecord[];
  product: ProductRecord | null;
  research: ResearchResultRecord | null;
  listings: ListingRecord[];
  tasks: TaskRecord[];
  navigate: (view: ViewKey) => void;
  openProduct: (id: string, view: ViewKey) => void;
  create: () => void;
  notify: (message: string) => void;
  runTask: (type: TaskType) => Promise<void>;
  refresh: () => Promise<void>;
  dirty: boolean;
  setDirty: (value: boolean) => void;
};
