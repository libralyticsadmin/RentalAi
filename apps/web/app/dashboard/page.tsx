import Link from "next/link";
import { getAuthMode, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getSession();
  const authMode = getAuthMode();
  const orgId = session?.org.id;

  const [orgCount, propertyCount, reservationCount, blockCount] =
    await Promise.all([
      prisma.organization.count(),
      orgId
        ? prisma.property.count({ where: { organizationId: orgId } })
        : Promise.resolve(0),
      orgId
        ? prisma.reservation.count({ where: { organizationId: orgId } })
        : Promise.resolve(0),
      orgId
        ? prisma.calendarBlock.count({
            where: { property: { organizationId: orgId } },
          })
        : Promise.resolve(0),
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
          Phase 1 spine for{" "}
          <span className="text-[var(--text)]">{session?.org.name}</span> —
          properties, calendar blocks, and reservations (no double-book).
        </p>
      </header>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          At a glance
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="border-t border-[var(--border)] pt-3">
            <dt className="text-xs text-[var(--text-muted)]">Orgs</dt>
            <dd className="mt-1 font-display text-3xl">{orgCount}</dd>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <dt className="text-xs text-[var(--text-muted)]">Properties</dt>
            <dd className="mt-1 font-display text-3xl">{propertyCount}</dd>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <dt className="text-xs text-[var(--text-muted)]">Reservations</dt>
            <dd className="mt-1 font-display text-3xl">{reservationCount}</dd>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <dt className="text-xs text-[var(--text-muted)]">Blocks</dt>
            <dd className="mt-1 font-display text-3xl">{blockCount}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-14 max-w-2xl border-t border-[var(--border)] pt-8">
        <h2 className="font-display text-2xl">Operator path</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--text-muted)]">
          <li>
            <Link href="/dashboard/properties" className="text-[var(--accent)] hover:underline">
              Create a listing
            </Link>
          </li>
          <li>
            <Link href="/dashboard/calendar" className="text-[var(--accent)] hover:underline">
              Block dates
            </Link>{" "}
            on the calendar
          </li>
          <li>
            <Link href="/dashboard/reservations" className="text-[var(--accent)] hover:underline">
              Book a stay
            </Link>{" "}
            and open the guest on the reservation
          </li>
        </ol>
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
