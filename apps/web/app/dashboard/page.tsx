import { getAuthMode, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getSession();
  const authMode = getAuthMode();

  const [orgCount, userCount, membershipCount] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.membership.count(),
  ]);

  return (
    <main className="px-6 py-10 md:px-10">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Authenticated · {authMode} auth
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
          Dashboard
        </h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Empty Phase 0 shell for{" "}
          <span className="text-[var(--text)]">{session?.org.name}</span>.
          Properties, calendar, and reservations arrive in Phase 1.
        </p>
      </header>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Tenant model
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="border-t border-[var(--border)] pt-3">
            <dt className="text-xs text-[var(--text-muted)]">Organizations</dt>
            <dd className="mt-1 font-display text-3xl">{orgCount}</dd>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <dt className="text-xs text-[var(--text-muted)]">Users</dt>
            <dd className="mt-1 font-display text-3xl">{userCount}</dd>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <dt className="text-xs text-[var(--text-muted)]">Memberships</dt>
            <dd className="mt-1 font-display text-3xl">{membershipCount}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-14 max-w-2xl border-t border-[var(--border)] pt-8">
        <h2 className="font-display text-2xl">Nothing here yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          This is the authenticated empty dashboard exit criterion for Phase 0.
          Next: inventory CRUD, availability calendar, and reservations.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-[var(--text-muted)]">
          <li>
            Signed in as{" "}
            <span className="text-[var(--text)]">{session?.email}</span> (
            {session?.role})
          </li>
          <li>
            Org slug:{" "}
            <span className="text-[var(--text)]">{session?.org.slug}</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
