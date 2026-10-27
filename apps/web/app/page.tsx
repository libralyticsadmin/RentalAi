import Link from "next/link";
import { getAuthMode, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  const authMode = getAuthMode();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="font-display text-5xl tracking-tight text-[var(--text)] md:text-6xl">
          RentalAi
        </p>
        <h1 className="mt-6 max-w-xl text-xl font-normal leading-relaxed text-[var(--text-muted)] md:text-2xl">
          Phase 0 scaffold — multi-tenant org shell, local SQLite, empty
          dashboard ready for the PMS spine.
        </h1>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Auth mode: <code className="text-[var(--accent)]">{authMode}</code>
          {authMode === "mock" ? " (no secrets required)" : ""}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/api/auth/mock-login"
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#06140f] transition hover:bg-[#4aaf8c]"
          >
            Enter demo dashboard
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent-soft)] hover:text-[var(--text)]"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
