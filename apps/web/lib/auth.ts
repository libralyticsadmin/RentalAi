import { cookies } from "next/headers";
import type { OrgRole, SessionUserStub } from "@rentalai/shared";
import { prisma } from "./db";

export const SESSION_COOKIE = "rentalai_session";

const DEMO_EMAIL = "operator@rentalai.local";

export function getAuthMode(): "mock" | "clerk" {
  const mode = (process.env.AUTH_MODE ?? "mock").toLowerCase();
  if (mode === "clerk") {
    const hasKeys =
      Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
      Boolean(process.env.CLERK_SECRET_KEY);
    if (!hasKeys) {
      return "mock";
    }
    return "clerk";
  }
  return "mock";
}

/** Ensure demo org + owner exist (idempotent). */
export async function ensureDemoTenant() {
  const org = await prisma.organization.upsert({
    where: { slug: "demo-pmc" },
    update: {},
    create: { name: "Demo PMC", slug: "demo-pmc" },
  });

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: "Demo Operator" },
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

  return { org, user };
}

export async function getSession(): Promise<SessionUserStub | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { userId: string; orgId: string };
    const membership = await prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: parsed.orgId,
          userId: parsed.userId,
        },
      },
      include: { user: true, organization: true },
    });
    if (!membership) return null;

    return {
      id: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      role: membership.role as OrgRole,
      org: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
      },
    };
  } catch {
    return null;
  }
}

export async function createMockSessionCookie(): Promise<SessionUserStub> {
  const { org, user } = await ensureDemoTenant();
  const session: SessionUserStub = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: "owner",
    org: { id: org.id, name: org.name, slug: org.slug },
  };

  const jar = await cookies();
  jar.set(
    SESSION_COOKIE,
    JSON.stringify({ userId: user.id, orgId: org.id }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      // Localhost only — not a production auth model.
      secure: process.env.NODE_ENV === "production",
    },
  );

  return session;
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
