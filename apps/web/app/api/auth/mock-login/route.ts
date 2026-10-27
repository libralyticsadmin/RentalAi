import { NextResponse } from "next/server";
import { createMockSessionCookie, getAuthMode } from "@/lib/auth";

function safeNextPath(raw: string | null, origin: string): URL {
  const fallback = new URL("/dashboard", origin);
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  try {
    return new URL(raw, origin);
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  if (getAuthMode() !== "mock") {
    return NextResponse.json(
      { error: "Mock login only available when AUTH_MODE=mock" },
      { status: 400 },
    );
  }

  await createMockSessionCookie();
  const url = new URL(request.url);
  const dest = safeNextPath(url.searchParams.get("next"), url.origin);
  return NextResponse.redirect(dest);
}

export async function POST(request: Request) {
  return GET(request);
}
