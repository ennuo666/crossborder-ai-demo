import { NextResponse } from "next/server";
import { currentUser } from "./auth";
import { ResourceNotFound } from "@/services/ownership-service";

export async function authenticated(request: Request, action: (userId: string) => Promise<Response>) {
  const started = Date.now();
  try {
    const user = await currentUser(request.headers);
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (request.method !== "GET" && request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL ?? request.url).origin) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const response = await action(user.id);
    console.info(JSON.stringify({ event: "request", method: request.method, userId: user.id, status: response.status, latency: Date.now() - started }));
    return response;
  } catch (error) {
    if (error instanceof ResourceNotFound) return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
