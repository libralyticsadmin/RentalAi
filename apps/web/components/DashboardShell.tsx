import Link from "next/link";
import { DASHBOARD_NAV, type SessionUserStub } from "@rentalai/shared";

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUserStub;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 md:border-b-0 md:border-r">
        <div className="px-5 py-6">
          <Link href="/dashboard" className="font-display text-2xl tracking-tight">
            RentalAi
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {user.org.name}
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-visible">
          {DASHBOARD_NAV.map((item) => {
            const enabled = item.phase === 0;
            return (
              <Link
                key={item.href}
                href={enabled ? item.href : "#"}
                aria-disabled={!enabled}
                className={
                  enabled
                    ? "rounded-md px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg-soft)]"
                    : "cursor-not-allowed rounded-md px-3 py-2 text-sm text-[var(--text-muted)] opacity-50"
                }
                title={enabled ? undefined : `Phase ${item.phase}`}
              >
                {item.label}
                {!enabled && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide">
                    P{item.phase}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-[var(--border)] px-5 py-4 text-sm md:block">
          <p className="font-medium">{user.name}</p>
          <p className="text-[var(--text-muted)]">{user.role}</p>
          <Link
            href="/api/auth/logout"
            className="mt-3 inline-block text-xs text-[var(--accent)] hover:underline"
          >
            Sign out
          </Link>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
