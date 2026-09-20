"use client";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import "@/app/auth.css";

export function AuthForm({ register = false }: { register?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <main className="auth-page"><form className="auth-form" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const credentials = { email: String(data.get("email")), password: String(data.get("password")) };
    try {
      const result = register ? await authClient.signUp.email({ ...credentials, name: String(data.get("name")) }) : await authClient.signIn.email(credentials);
      if (result.error) setError(register ? "注册失败，请检查信息后重试。" : "邮箱或密码不正确，请重试。");
      else window.location.assign("/");
    } catch { setError("暂时无法连接，请稍后重试。"); }
    finally { setBusy(false); }
  }}><p>跨境 AI 工作台</p><h1>{register ? "创建账户" : "登录"}</h1>
    {register && <label>姓名<input name="name" autoComplete="name" required maxLength={100} /></label>}
    <label>邮箱<input name="email" type="email" autoComplete="email" required /></label>
    <label>密码<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={12} maxLength={128} required /></label>
    {register && <small>密码至少 12 位</small>}
    <p role="alert">{error}</p><Button type="submit" disabled={busy}>{busy ? "请稍候…" : register ? "注册" : "登录"}</Button>
    <Link href={register ? "/login" : "/register"}>{register ? "已有账户，去登录" : "创建新账户"}</Link>
  </form></main>;
}
