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
    if (getAuthMode() === "mock") {
      redirect("/api/auth/mock-login");
    }
    redirect("/");
  }

  return <DashboardShell user={session}>{children}</DashboardShell>;
}
