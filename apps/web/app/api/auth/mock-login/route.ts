import { NextResponse } from "next/server";
import { createMockSessionCookie, getAuthMode } from "@/lib/auth";

export async function GET(request: Request) {
  if (getAuthMode() !== "mock") {
    return NextResponse.json(
      { error: "Mock login only available when AUTH_MODE=mock" },
      { status: 400 },
    );
  }

  await createMockSessionCookie();
  const url = new URL(request.url);
  const dest = new URL("/dashboard", url.origin);
  return NextResponse.redirect(dest);
}

export async function POST(request: Request) {
  return GET(request);
}
