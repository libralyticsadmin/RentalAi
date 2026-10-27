/** Shared domain types for multi-tenant PMS spine. */

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

export type ReservationStatus =
  | "inquiry"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled";

/** Statuses that occupy inventory (block other confirmed stays). */
export const OCCUPYING_STATUSES: ReservationStatus[] = [
  "confirmed",
  "checked_in",
];

export const RESERVATION_STATUSES: ReservationStatus[] = [
  "inquiry",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
];

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", phase: 0 },
  { href: "/dashboard/properties", label: "Properties", phase: 1 },
  { href: "/dashboard/calendar", label: "Calendar", phase: 1 },
  { href: "/dashboard/reservations", label: "Reservations", phase: 1 },
  { href: "/dashboard/inbox", label: "Inbox", phase: 2 },
  { href: "/dashboard/tasks", label: "Tasks", phase: 2 },
  { href: "/dashboard/sync", label: "Sync health", phase: 3 },
] as const;

/** Half-open range overlap: [aStart, aEnd) ∩ [bStart, bEnd) ≠ ∅ */
export function rangesOverlap(
  aStart: Date | string,
  aEnd: Date | string,
  bStart: Date | string,
  bEnd: Date | string,
): boolean {
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && bs < ae;
}
