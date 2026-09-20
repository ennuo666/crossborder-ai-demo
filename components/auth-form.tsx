"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import "@/app/auth.css";

export function AuthForm({ register = false }: { register?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return <main className="auth-page"><header className="auth-brand"><span><Boxes size={23} /></span><strong>跨境 AI 工作台</strong><small>SELLER WORKSPACE</small></header><section className="auth-panel"><div className="auth-heading"><span className="auth-eyebrow">你的商品工作区</span><h1>{register ? "创建账户" : "欢迎回来"}</h1><p>{register ? "开始你的 Amazon 商品研究与内容创作。" : "登录后继续竞品研究与 Listing 创作。"}</p></div><form className="auth-form" method="post" action="/api/auth/form-unavailable" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const credentials = { email: String(data.get("email")), password: String(data.get("password")) };
    try {
      const result = register ? await authClient.signUp.email({ ...credentials, name: String(data.get("name")) }) : await authClient.signIn.email(credentials);
      if (result.error) setError(register ? "注册失败，请检查信息后重试。" : "邮箱或密码不正确，请重试。");
      else window.location.assign("/");
    } catch { setError("暂时无法连接，请稍后重试。"); }
    finally { setBusy(false); }
  }}><fieldset disabled={!ready || busy}>
    {register && <label>姓名<input name="name" autoComplete="name" placeholder="你的称呼" required maxLength={100} /></label>}
    <label>邮箱<input name="email" type="email" autoComplete="email" placeholder="name@company.com" required /></label>
    <label>密码<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "至少 12 位字符" : "输入你的密码"} minLength={register ? 12 : undefined} maxLength={128} required /></label>
    {register && <small>密码至少 12 位</small>}
    {error && <p role="alert">{error}</p>}<Button type="submit" disabled={!ready || busy}>{busy ? <LoaderCircle className="animate-spin" size={17} /> : null}{!ready ? "正在准备登录" : busy ? "正在处理" : register ? "创建账户" : "登录工作台"}{ready && !busy && <ArrowRight size={17} />}</Button>
    </fieldset><noscript><p className="auth-notice">登录需要启用 JavaScript。请启用后刷新页面，暂勿输入密码。</p></noscript>
    <p className="auth-switch">{register ? "已有账户？" : "还没有账户？"}<Link href={register ? "/login" : "/register"}>{register ? "登录" : "创建新账户"}</Link></p>
  </form></section><footer className="auth-footer">Amazon 市场研究 · AI 洞察 · 双语 Listing</footer></main>;
}
