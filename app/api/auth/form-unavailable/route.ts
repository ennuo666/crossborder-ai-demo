import { NextResponse } from "next/server";

// A non-hydrated browser must never serialize credentials into a query string.
export function POST(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
