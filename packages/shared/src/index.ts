/** Shared domain stubs for Phase 0 multi-tenant model. */

export type OrgRole = "owner" | "admin" | "manager" | "staff" | "cleaner" | "viewer";

export const ORG_ROLES: OrgRole[] = [
  "owner",
  "admin",
  "manager",
  "staff",
  "cleaner",
  "viewer",
];

export interface OrganizationStub {
  id: string;
  name: string;
  slug: string;
}

export interface MembershipStub {
  orgId: string;
  userId: string;
  role: OrgRole;
}

export interface SessionUserStub {
  id: string;
  email: string;
  name: string;
  org: OrganizationStub;
  role: OrgRole;
}

/** Empty dashboard nav — Phase 1+ fills these surfaces. */
export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", phase: 0 },
  { href: "/dashboard/properties", label: "Properties", phase: 1 },
  { href: "/dashboard/calendar", label: "Calendar", phase: 1 },
  { href: "/dashboard/reservations", label: "Reservations", phase: 1 },
  { href: "/dashboard/inbox", label: "Inbox", phase: 2 },
  { href: "/dashboard/tasks", label: "Tasks", phase: 2 },
  { href: "/dashboard/sync", label: "Sync health", phase: 3 },
] as const;
