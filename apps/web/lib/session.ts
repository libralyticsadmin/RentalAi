import { redirect } from "next/navigation";
import type { SessionUserStub } from "@rentalai/shared";
import { getAuthMode, getSession } from "./auth";

export async function requireSession(): Promise<SessionUserStub> {
  const session = await getSession();
  if (!session) {
    if (getAuthMode() === "mock") {
      redirect("/api/auth/mock-login");
    }
    redirect("/");
  }
  return session;
}
