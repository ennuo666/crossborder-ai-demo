import { getAuth } from "@/lib/auth";
export const runtime = "nodejs";
export const GET = (request: Request) => getAuth().handler(request);
export const POST = (request: Request) => getAuth().handler(request);
