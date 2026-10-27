import { OCCUPYING_STATUSES, rangesOverlap } from "@rentalai/shared";
import { prisma } from "./db";

export type ConflictHit =
  | { kind: "reservation"; id: string; checkIn: Date; checkOut: Date; status: string }
  | { kind: "block"; id: string; startDate: Date; endDate: Date; reason: string | null };

/**
 * Find inventory conflicts for a property (and optional unit) over [start, end).
 * Occupying reservations + calendar blocks both conflict.
 *
 * Scope:
 * - booking a unit: conflicts with same unit OR property-wide (unitId null)
 * - booking property-wide: conflicts with any unit/block on the property
 */
export async function findConflicts(args: {
  propertyId: string;
  unitId?: string | null;
  start: Date;
  end: Date;
  excludeReservationId?: string;
}): Promise<ConflictHit[]> {
  const { propertyId, unitId, start, end, excludeReservationId } = args;

  const reservations = await prisma.reservation.findMany({
    where: {
      propertyId,
      status: { in: [...OCCUPYING_STATUSES] },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    select: { id: true, checkIn: true, checkOut: true, status: true, unitId: true },
  });

  const blocks = await prisma.calendarBlock.findMany({
    where: { propertyId },
    select: { id: true, startDate: true, endDate: true, reason: true, unitId: true },
  });

  const hits: ConflictHit[] = [];

  for (const r of reservations) {
    if (!inventoryOverlaps(unitId ?? null, r.unitId) ) continue;
    if (rangesOverlap(start, end, r.checkIn, r.checkOut)) {
      hits.push({
        kind: "reservation",
        id: r.id,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status,
      });
    }
  }

  for (const b of blocks) {
    if (!inventoryOverlaps(unitId ?? null, b.unitId)) continue;
    if (rangesOverlap(start, end, b.startDate, b.endDate)) {
      hits.push({
        kind: "block",
        id: b.id,
        startDate: b.startDate,
        endDate: b.endDate,
        reason: b.reason,
      });
    }
  }

  return hits;
}

/** Two inventory scopes collide if either is property-wide or they share a unit. */
function inventoryOverlaps(
  a: string | null,
  b: string | null,
): boolean {
  if (a == null || b == null) return true;
  return a === b;
}

export function conflictMessage(hits: ConflictHit[]): string {
  if (hits.length === 0) return "";
  const first = hits[0];
  if (first.kind === "reservation") {
    return `Dates conflict with an existing ${first.status} reservation (${first.id.slice(0, 8)}…).`;
  }
  return `Dates conflict with a calendar block${first.reason ? `: ${first.reason}` : ""}.`;
}
