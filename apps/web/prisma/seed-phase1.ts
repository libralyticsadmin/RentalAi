/**
 * Optional Phase 1 demo inventory for local screenshots / smoke.
 * Run: pnpm --filter @rentalai/web exec tsx prisma/seed-phase1.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function d(iso: string) {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day, 12));
}

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "demo-pmc" },
    update: {},
    create: { name: "Demo PMC", slug: "demo-pmc" },
  });

  const existing = await prisma.property.findFirst({
    where: { organizationId: org.id, name: "Kamala Cliff Villa" },
  });
  if (existing) {
    console.log("Phase 1 demo already present:", existing.id);
    return;
  }

  const property = await prisma.property.create({
    data: {
      organizationId: org.id,
      name: "Kamala Cliff Villa",
      address: "Kamala, Phuket",
      baseRateCents: 450000,
      currency: "THB",
      units: {
        create: { name: "Entire villa", bedrooms: 3, maxGuests: 6 },
      },
    },
    include: { units: true },
  });

  const unit = property.units[0];

  await prisma.calendarBlock.create({
    data: {
      propertyId: property.id,
      unitId: unit.id,
      startDate: d("2026-11-10"),
      endDate: d("2026-11-14"),
      reason: "Owner stay",
    },
  });

  const guest = await prisma.guest.create({
    data: {
      organizationId: org.id,
      name: "Alex Guest",
      email: "alex@example.com",
      phone: "+66 81 000 0000",
    },
  });

  const reservation = await prisma.reservation.create({
    data: {
      organizationId: org.id,
      propertyId: property.id,
      unitId: unit.id,
      guestId: guest.id,
      checkIn: d("2026-11-20"),
      checkOut: d("2026-11-25"),
      status: "confirmed",
      nightlyRateCents: property.baseRateCents,
      notes: "Direct booking — Phase 1 demo",
    },
  });

  console.log("Seeded property", property.id, "reservation", reservation.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
