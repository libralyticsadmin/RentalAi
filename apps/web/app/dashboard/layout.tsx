import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { getAuthMode, getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    // Mock mode: bounce through the route handler that can set cookies.
    if (getAuthMode() === "mock") {
      redirect("/api/auth/mock-login");
    }
    redirect("/");
  }

  return <DashboardShell user={session}>{children}</DashboardShell>;
}
