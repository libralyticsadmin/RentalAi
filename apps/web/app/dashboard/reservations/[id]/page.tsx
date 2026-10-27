import Link from "next/link";
import { notFound } from "next/navigation";
import { updateReservationStatus } from "@/lib/actions";
import { formatMoney, nightsBetween, toDateInput } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { ActionForm } from "@/components/ActionForm";
import { Field, PageHeader, Panel, PrimaryButton, Select } from "@/components/ui";
import { RESERVATION_STATUSES } from "@rentalai/shared";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const reservation = await prisma.reservation.findFirst({
    where: { id, organizationId: session.org.id },
    include: { guest: true, property: true, unit: true },
  });
  if (!reservation) notFound();

  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
  const total =
    reservation.nightlyRateCents != null
      ? reservation.nightlyRateCents * nights
      : null;

  return (
    <main className="px-6 py-10 md:px-10">
      <p className="mb-4 text-sm">
        <Link href="/dashboard/reservations" className="text-[var(--accent)] hover:underline">
          ← All reservations
        </Link>
      </p>
      <PageHeader
        eyebrow="Stay detail"
        title={reservation.guest.name}
        description={`${reservation.property.name}${reservation.unit ? ` · ${reservation.unit.name}` : ""}`}
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <Panel title="Guest & dates">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">Guest</dt>
              <dd className="mt-1 font-medium">{reservation.guest.name}</dd>
              {(reservation.guest.email || reservation.guest.phone) && (
                <dd className="text-[var(--text-muted)]">
                  {[reservation.guest.email, reservation.guest.phone]
                    .filter(Boolean)
                    .join(" · ")}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Stay</dt>
              <dd className="mt-1">
                {toDateInput(reservation.checkIn)} → {toDateInput(reservation.checkOut)} (
                {nights} night{nights === 1 ? "" : "s"})
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Rate</dt>
              <dd className="mt-1">
                {reservation.nightlyRateCents != null
                  ? `${formatMoney(reservation.nightlyRateCents, reservation.property.currency)}/night`
                  : "—"}
                {total != null
                  ? ` · ${formatMoney(total, reservation.property.currency)} total`
                  : ""}
              </dd>
            </div>
            {reservation.notes && (
              <div>
                <dt className="text-[var(--text-muted)]">Notes</dt>
                <dd className="mt-1">{reservation.notes}</dd>
              </div>
            )}
          </dl>
        </Panel>

        <Panel title="Status">
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            Current: <span className="text-[var(--text)]">{reservation.status}</span>
          </p>
          <ActionForm action={updateReservationStatus} className="space-y-4">
            <input type="hidden" name="id" value={reservation.id} />
            <Field label="Update status">
              <Select name="status" defaultValue={reservation.status}>
                {RESERVATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <PrimaryButton>Save status</PrimaryButton>
          </ActionForm>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Moving to confirmed/checked_in re-checks conflicts against other occupying stays and
            calendar blocks.
          </p>
        </Panel>
      </div>
    </main>
  );
}
