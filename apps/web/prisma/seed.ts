import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "demo-pmc" },
    update: {},
    create: {
      name: "Demo PMC",
      slug: "demo-pmc",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "operator@rentalai.local" },
    update: {},
    create: {
      email: "operator@rentalai.local",
      name: "Demo Operator",
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: { role: "owner" },
    create: {
      organizationId: org.id,
      userId: user.id,
      role: "owner",
    },
  });

  console.log("Seeded demo org:", org.slug, "user:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
