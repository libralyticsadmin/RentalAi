import Link from "next/link";
import { createBlock, deleteBlock } from "@/lib/actions";
import {
  addDaysUTC,
  daysInMonthUTC,
  startOfMonthUTC,
  toDateInput,
} from "@/lib/dates";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { ActionForm } from "@/components/ActionForm";
import {
  Field,
  GhostButton,
  Input,
  PageHeader,
  Panel,
  PrimaryButton,
  Select,
} from "@/components/ui";
import { rangesOverlap } from "@rentalai/shared";

function monthLabel(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string; propertyId?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const now = new Date();
  const year = Number(sp.y) || now.getUTCFullYear();
  const monthIndex = sp.m != null ? Number(sp.m) : now.getUTCMonth();
  const monthStart = startOfMonthUTC(year, monthIndex);
  const days = daysInMonthUTC(year, monthIndex);
  const monthEnd = addDaysUTC(monthStart, days);

  const properties = await prisma.property.findMany({
    where: { organizationId: session.org.id, status: "active" },
    include: { units: true },
    orderBy: { name: "asc" },
  });

  const propertyId = sp.propertyId || properties[0]?.id || "";
  const selected = properties.find((p) => p.id === propertyId) ?? properties[0];

  const [blocks, reservations] = selected
    ? await Promise.all([
        prisma.calendarBlock.findMany({
          where: {
            propertyId: selected.id,
            startDate: { lt: monthEnd },
            endDate: { gt: monthStart },
          },
          orderBy: { startDate: "asc" },
        }),
        prisma.reservation.findMany({
          where: {
            propertyId: selected.id,
            status: { in: ["confirmed", "checked_in", "inquiry"] },
            checkIn: { lt: monthEnd },
            checkOut: { gt: monthStart },
          },
          include: { guest: true, unit: true },
          orderBy: { checkIn: "asc" },
        }),
      ])
    : [[], []];

  const prev = monthIndex === 0 ? { y: year - 1, m: 11 } : { y: year, m: monthIndex - 1 };
  const next = monthIndex === 11 ? { y: year + 1, m: 0 } : { y: year, m: monthIndex + 1 };

  const dayCells = Array.from({ length: days }, (_, i) => {
    const day = addDaysUTC(monthStart, i);
    const dayEnd = addDaysUTC(day, 1);
    const dayBlocks = blocks.filter((b) =>
      rangesOverlap(day, dayEnd, b.startDate, b.endDate),
    );
    const dayRes = reservations.filter((r) =>
      rangesOverlap(day, dayEnd, r.checkIn, r.checkOut),
    );
    return { day, dayBlocks, dayRes };
  });

  return (
    <main className="px-6 py-10 md:px-10">
      <PageHeader
        eyebrow="Phase 1 · Availability"
        title="Calendar"
        description="Month view with base inventory. Blocks and occupying stays are visible; double-book is rejected on write."
        actions={
          <div className="flex items-center gap-2 text-sm">
            <Link
              className="rounded-md border border-[var(--border)] px-3 py-1.5 hover:border-[var(--accent-soft)]"
              href={`/dashboard/calendar?y=${prev.y}&m=${prev.m}${propertyId ? `&propertyId=${propertyId}` : ""}`}
            >
              ←
            </Link>
            <span className="min-w-[10rem] text-center font-medium">
              {monthLabel(year, monthIndex)}
            </span>
            <Link
              className="rounded-md border border-[var(--border)] px-3 py-1.5 hover:border-[var(--accent-soft)]"
              href={`/dashboard/calendar?y=${next.y}&m=${next.m}${propertyId ? `&propertyId=${propertyId}` : ""}`}
            >
              →
            </Link>
          </div>
        }
      />

      {properties.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          Create a{" "}
          <Link href="/dashboard/properties" className="text-[var(--accent)]">
            property
          </Link>{" "}
          first.
        </p>
      ) : (
        <div className="grid gap-12 xl:grid-cols-[1fr_300px]">
          <div>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              Property:{" "}
              {properties.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && " · "}
                  <Link
                    href={`/dashboard/calendar?y=${year}&m=${monthIndex}&propertyId=${p.id}`}
                    className={
                      p.id === selected?.id
                        ? "font-medium text-[var(--accent)]"
                        : "hover:text-[var(--accent)]"
                    }
                  >
                    {p.name}
                  </Link>
                </span>
              ))}
            </p>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {/* Pad to Monday-start */}
              {Array.from({
                length: (monthStart.getUTCDay() + 6) % 7,
              }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-[72px]" />
              ))}
              {dayCells.map(({ day, dayBlocks, dayRes }) => {
                const busy = dayBlocks.length > 0 || dayRes.length > 0;
                return (
                  <div
                    key={toDateInput(day)}
                    className={`min-h-[72px] rounded-md border p-1.5 text-left ${
                      busy
                        ? "border-[var(--accent-soft)] bg-[var(--bg-soft)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)]/40"
                    }`}
                  >
                    <div className="text-xs font-medium">{day.getUTCDate()}</div>
                    {dayRes.slice(0, 2).map((r) => (
                      <Link
                        key={r.id}
                        href={`/dashboard/reservations/${r.id}`}
                        className="mt-0.5 block truncate text-[10px] text-[var(--accent)]"
                        title={r.guest.name}
                      >
                        {r.guest.name}
                      </Link>
                    ))}
                    {dayBlocks.slice(0, 1).map((b) => (
                      <div
                        key={b.id}
                        className="mt-0.5 truncate text-[10px] text-[var(--warn)]"
                        title={b.reason ?? "Blocked"}
                      >
                        {b.reason ?? "Blocked"}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <Panel title="This month" className="mt-10">
              <ul className="space-y-2 text-sm">
                {reservations.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/reservations/${r.id}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {r.guest.name}
                    </Link>
                    <span className="text-[var(--text-muted)]">
                      {" "}
                      · {toDateInput(r.checkIn)} → {toDateInput(r.checkOut)} · {r.status}
                    </span>
                  </li>
                ))}
                {blocks.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center gap-2">
                    <span className="text-[var(--warn)]">
                      Block · {toDateInput(b.startDate)} → {toDateInput(b.endDate)}
                      {b.reason ? ` · ${b.reason}` : ""}
                    </span>
                    <ActionForm action={deleteBlock}>
                      <input type="hidden" name="id" value={b.id} />
                      <GhostButton>Remove</GhostButton>
                    </ActionForm>
                  </li>
                ))}
                {reservations.length === 0 && blocks.length === 0 && (
                  <li className="text-[var(--text-muted)]">No stays or blocks in this month.</li>
                )}
              </ul>
            </Panel>
          </div>

          <Panel title="Block dates">
            <ActionForm action={createBlock} className="space-y-4">
              <input type="hidden" name="propertyId" value={selected!.id} />
              <Field label="Unit (optional)">
                <Select name="unitId" defaultValue="">
                  <option value="">Entire property</option>
                  {selected!.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Start">
                <Input name="startDate" type="date" required />
              </Field>
              <Field label="End (exclusive / checkout-style)">
                <Input name="endDate" type="date" required />
              </Field>
              <Field label="Reason">
                <Input name="reason" placeholder="Owner stay / maintenance" />
              </Field>
              <PrimaryButton>Add block</PrimaryButton>
            </ActionForm>
            <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
              End date is exclusive (same as hotel checkout). Blocks cannot overlap confirmed
              stays; confirmed bookings cannot overlap blocks.
            </p>
          </Panel>
        </div>
      )}
    </main>
  );
}
