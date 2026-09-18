import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "跨境 AI 工作台",
  description: "以商品为中心的跨境电商 AI 工作台 MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
