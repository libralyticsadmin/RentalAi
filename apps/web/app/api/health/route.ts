import { NextResponse } from "next/server";
import { getAuthMode } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json({
    ok: true,
    service: "rentalai-web",
    phase: 0,
    authMode: getAuthMode(),
    db: dbOk ? "up" : "down",
  });
}
