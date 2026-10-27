import Link from "next/link";
import { notFound } from "next/navigation";
import { addUnit, updateProperty } from "@/lib/actions";
import { formatMoney } from "@/lib/dates";
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
} from "@/components/ui";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, organizationId: session.org.id },
    include: { units: { orderBy: { createdAt: "asc" } } },
  });
  if (!property) notFound();

  return (
    <main className="px-6 py-10 md:px-10">
      <p className="mb-4 text-sm">
        <Link href="/dashboard/properties" className="text-[var(--accent)] hover:underline">
          ← All properties
        </Link>
      </p>
      <PageHeader
        eyebrow="Property detail"
        title={property.name}
        description={`${formatMoney(property.baseRateCents, property.currency)}/night · ${property.timezone}`}
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <Panel title="Details">
          <ActionForm action={updateProperty} className="space-y-4">
            <input type="hidden" name="id" value={property.id} />
            <Field label="Name">
              <Input name="name" defaultValue={property.name} required />
            </Field>
            <Field label="Address">
              <Input name="address" defaultValue={property.address ?? ""} />
            </Field>
            <Field label="Base nightly rate (THB)">
              <Input
                name="baseRate"
                type="number"
                min={0}
                step={100}
                defaultValue={property.baseRateCents / 100}
                required
              />
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue={property.status}>
                <option value="active">active</option>
                <option value="archived">archived</option>
              </Select>
            </Field>
            <PrimaryButton>Save changes</PrimaryButton>
          </ActionForm>
        </Panel>

        <Panel title="Units">
          <ul className="mb-6 space-y-3">
            {property.units.map((u) => (
              <li key={u.id} className="border-t border-[var(--border)] pt-3 text-sm">
                <span className="font-medium">{u.name}</span>
                <span className="text-[var(--text-muted)]">
                  {" "}
                  · {u.bedrooms} bed · max {u.maxGuests}
                </span>
              </li>
            ))}
          </ul>
          <ActionForm action={addUnit} className="space-y-3">
            <input type="hidden" name="propertyId" value={property.id} />
            <Field label="Unit name">
              <Input name="name" required placeholder="Studio B" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bedrooms">
                <Input name="bedrooms" type="number" min={0} defaultValue={1} />
              </Field>
              <Field label="Max guests">
                <Input name="maxGuests" type="number" min={1} defaultValue={2} />
              </Field>
            </div>
            <PrimaryButton>Add unit</PrimaryButton>
          </ActionForm>
        </Panel>
      </div>
    </main>
  );
}
