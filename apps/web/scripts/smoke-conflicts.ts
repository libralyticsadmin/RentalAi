import { PrismaClient } from "@prisma/client";
import { findConflicts } from "../lib/conflicts";

const prisma = new PrismaClient();

function d(iso: string) {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day, 12));
}

async function main() {
  const property = await prisma.property.findFirst({
    where: { name: "Kamala Cliff Villa" },
    include: { units: true, reservations: true },
  });
  if (!property) throw new Error("missing demo property");

  const unitId = property.units[0]?.id;
  const overStay = await findConflicts({
    propertyId: property.id,
    unitId,
    start: d("2026-11-21"),
    end: d("2026-11-23"),
  });
  const overBlock = await findConflicts({
    propertyId: property.id,
    unitId,
    start: d("2026-11-11"),
    end: d("2026-11-12"),
  });
  const free = await findConflicts({
    propertyId: property.id,
    unitId,
    start: d("2026-12-01"),
    end: d("2026-12-05"),
  });

  console.log(
    JSON.stringify(
      {
        overStay: overStay.length,
        overBlock: overBlock.length,
        free: free.length,
        ok: overStay.length > 0 && overBlock.length > 0 && free.length === 0,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
