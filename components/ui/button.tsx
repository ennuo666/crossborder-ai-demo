import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost"; size?: "default" | "sm" };

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return <button className={cn("inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:pointer-events-none disabled:opacity-50", variant === "default" ? "bg-slate-800 text-white hover:bg-slate-900" : variant === "outline" ? "border border-slate-200 bg-white text-slate-600 hover:border-purple-400 hover:text-purple-600" : "text-slate-500 hover:bg-slate-100", size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2.5 text-xs", className)} {...props} />;
}
