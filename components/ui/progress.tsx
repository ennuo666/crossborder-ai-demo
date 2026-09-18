import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) { return <div className={cn("h-1.5 overflow-hidden rounded-full bg-slate-100", className)}><span className="block h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600" style={{ width: `${value}%` }} /></div>; }
