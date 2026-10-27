import Link from "next/link";
import { createProperty } from "@/lib/actions";
import { formatMoney } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { ActionForm } from "@/components/ActionForm";
import { Field, Input, PageHeader, Panel, PrimaryButton } from "@/components/ui";

export default async function PropertiesPage() {
  const session = await requireSession();
  const properties = await prisma.property.findMany({
    where: { organizationId: session.org.id },
    include: { units: true, _count: { select: { reservations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="px-6 py-10 md:px-10">
      <PageHeader
        eyebrow="Phase 1 · Inventory"
        title="Properties"
        description="Create listings and units for the demo org. Base nightly rate applies to new bookings."
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <Panel title="Listings">
          {properties.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No properties yet. Add your first listing.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {properties.map((p) => (
                <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                  <div>
                    <Link
                      href={`/dashboard/properties/${p.id}`}
                      className="font-display text-xl hover:text-[var(--accent)]"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {p.units.length} unit{p.units.length === 1 ? "" : "s"} ·{" "}
                      {formatMoney(p.baseRateCents, p.currency)}/night ·{" "}
                      {p._count.reservations} stay
                      {p._count.reservations === 1 ? "" : "s"}
                      {p.address ? ` · ${p.address}` : ""}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="New property">
          <ActionForm action={createProperty} className="space-y-4">
            <Field label="Name">
              <Input name="name" required placeholder="Ocean View Villa" />
            </Field>
            <Field label="Address">
              <Input name="address" placeholder="Kamala, Phuket" />
            </Field>
            <Field label="Base nightly rate (THB)">
              <Input name="baseRate" type="number" min={0} step={100} defaultValue={3500} required />
            </Field>
            <Field label="First unit name">
              <Input name="unitName" defaultValue="Entire home" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bedrooms">
                <Input name="bedrooms" type="number" min={0} defaultValue={2} />
              </Field>
              <Field label="Max guests">
                <Input name="maxGuests" type="number" min={1} defaultValue={4} />
              </Field>
            </div>
            <PrimaryButton>Create listing</PrimaryButton>
          </ActionForm>
        </Panel>
      </div>
    </main>
  );
}
