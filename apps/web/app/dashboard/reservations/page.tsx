import Link from "next/link";
import { createReservation } from "@/lib/actions";
import { formatMoney, toDateInput } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { ActionForm } from "@/components/ActionForm";
import {
  Field,
  Input,
  PageHeader,
  Panel,
  PrimaryButton,
  Select,
  Textarea,
} from "@/components/ui";

export default async function ReservationsPage() {
  const session = await requireSession();
  const [reservations, properties] = await Promise.all([
    prisma.reservation.findMany({
      where: { organizationId: session.org.id },
      include: { guest: true, property: true, unit: true },
      orderBy: { checkIn: "desc" },
    }),
    prisma.property.findMany({
      where: { organizationId: session.org.id, status: "active" },
      include: { units: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="px-6 py-10 md:px-10">
      <PageHeader
        eyebrow="Phase 1 · Stays"
        title="Reservations"
        description="Book a stay with a guest record. Confirmed/checked-in stays refuse double-booking against other stays and calendar blocks."
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
        <Panel title="Bookings">
          {reservations.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No reservations yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {reservations.map((r) => (
                <li key={r.id} className="py-4">
                  <Link
                    href={`/dashboard/reservations/${r.id}`}
                    className="font-display text-xl hover:text-[var(--accent)]"
                  >
                    {r.guest.name}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {r.property.name}
                    {r.unit ? ` · ${r.unit.name}` : ""} · {toDateInput(r.checkIn)} →{" "}
                    {toDateInput(r.checkOut)} ·{" "}
                    <span className="text-[var(--text)]">{r.status}</span>
                    {r.nightlyRateCents != null
                      ? ` · ${formatMoney(r.nightlyRateCents, r.property.currency)}/night`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="New reservation">
          {properties.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              Create a{" "}
              <Link href="/dashboard/properties" className="text-[var(--accent)]">
                property
              </Link>{" "}
              first.
            </p>
          ) : (
            <ActionForm action={createReservation} className="space-y-4">
              <Field label="Property">
                <Select name="propertyId" required defaultValue={properties[0].id}>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Unit">
                <Select name="unitId" defaultValue={properties[0].units[0]?.id ?? ""}>
                  {properties.flatMap((p) =>
                    p.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {p.name} — {u.name}
                      </option>
                    )),
                  )}
                </Select>
              </Field>
              <Field label="Guest name">
                <Input name="guestName" required placeholder="Alex Guest" />
              </Field>
              <Field label="Guest email">
                <Input name="guestEmail" type="email" placeholder="alex@example.com" />
              </Field>
              <Field label="Guest phone">
                <Input name="guestPhone" placeholder="+66…" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check-in">
                  <Input name="checkIn" type="date" required />
                </Field>
                <Field label="Check-out">
                  <Input name="checkOut" type="date" required />
                </Field>
              </div>
              <Field label="Status">
                <Select name="status" defaultValue="confirmed">
                  <option value="inquiry">inquiry</option>
                  <option value="confirmed">confirmed</option>
                  <option value="checked_in">checked_in</option>
                </Select>
              </Field>
              <Field label="Notes">
                <Textarea name="notes" rows={2} placeholder="Direct booking" />
              </Field>
              <PrimaryButton>Book stay</PrimaryButton>
            </ActionForm>
          )}
        </Panel>
      </div>
    </main>
  );
}
