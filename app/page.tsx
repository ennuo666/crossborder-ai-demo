import { WorkspaceApp } from "@/components/workspace/workspace-app";
import { currentUser } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await currentUser(await headers());
  if (!user) redirect("/login");
  return <WorkspaceApp user={{ name: user.name, email: user.email }} />;
}
