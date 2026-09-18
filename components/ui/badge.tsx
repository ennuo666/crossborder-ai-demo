import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) { return <span className={cn("inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500", className)} {...props} />; }
