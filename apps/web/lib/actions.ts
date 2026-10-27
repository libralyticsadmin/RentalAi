"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ReservationStatus } from "@rentalai/shared";
import { RESERVATION_STATUSES } from "@rentalai/shared";
import { conflictMessage, findConflicts } from "./conflicts";
import { nightsBetween, parseDateInput } from "./dates";
import { prisma } from "./db";
import { requireSession } from "./session";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function assertOrgProperty(orgId: string, propertyId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: orgId },
    include: { units: true },
  });
  if (!property) throw new Error("Property not found");
  return property;
}

export async function createProperty(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const baseRate = Number(formData.get("baseRate") ?? 0);
  const unitName = String(formData.get("unitName") ?? "").trim() || "Unit 1";
  const bedrooms = Number(formData.get("bedrooms") ?? 1);
  const maxGuests = Number(formData.get("maxGuests") ?? 2);

  if (!name) return { ok: false, error: "Name is required" };
  if (!Number.isFinite(baseRate) || baseRate < 0) {
    return { ok: false, error: "Base rate must be a non-negative number" };
  }

  const property = await prisma.property.create({
    data: {
      organizationId: session.org.id,
      name,
      address,
      baseRateCents: Math.round(baseRate * 100),
      units: {
        create: {
          name: unitName,
          bedrooms: Number.isFinite(bedrooms) ? bedrooms : 1,
          maxGuests: Number.isFinite(maxGuests) ? maxGuests : 2,
        },
      },
    },
  });

  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  return { ok: true, id: property.id };
}

export async function updateProperty(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const baseRate = Number(formData.get("baseRate") ?? 0);
  const status = String(formData.get("status") ?? "active");

  if (!id) return { ok: false, error: "Missing property id" };
  if (!name) return { ok: false, error: "Name is required" };

  try {
    await assertOrgProperty(session.org.id, id);
  } catch {
    return { ok: false, error: "Property not found" };
  }

  await prisma.property.update({
    where: { id },
    data: {
      name,
      address,
      baseRateCents: Math.round(Math.max(0, baseRate) * 100),
      status: status === "archived" ? "archived" : "active",
    },
  });

  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${id}`);
  revalidatePath("/dashboard/calendar");
  return { ok: true, id };
}

export async function addUnit(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const propertyId = String(formData.get("propertyId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const bedrooms = Number(formData.get("bedrooms") ?? 1);
  const maxGuests = Number(formData.get("maxGuests") ?? 2);

  if (!propertyId || !name) return { ok: false, error: "Property and unit name required" };

  try {
    await assertOrgProperty(session.org.id, propertyId);
  } catch {
    return { ok: false, error: "Property not found" };
  }

  const unit = await prisma.unit.create({
    data: {
      propertyId,
      name,
      bedrooms: Number.isFinite(bedrooms) ? bedrooms : 1,
      maxGuests: Number.isFinite(maxGuests) ? maxGuests : 2,
    },
  });

  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/dashboard/calendar");
  return { ok: true, id: unit.id };
}

export async function createBlock(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const propertyId = String(formData.get("propertyId") ?? "");
  const unitIdRaw = String(formData.get("unitId") ?? "").trim();
  const startRaw = String(formData.get("startDate") ?? "");
  const endRaw = String(formData.get("endDate") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!propertyId || !startRaw || !endRaw) {
    return { ok: false, error: "Property and dates are required" };
  }

  let start: Date;
  let end: Date;
  try {
    start = parseDateInput(startRaw);
    end = parseDateInput(endRaw);
  } catch {
    return { ok: false, error: "Invalid dates" };
  }
  if (!(end > start)) return { ok: false, error: "End date must be after start date" };

  let property;
  try {
    property = await assertOrgProperty(session.org.id, propertyId);
  } catch {
    return { ok: false, error: "Property not found" };
  }

  const unitId = unitIdRaw || null;
  if (unitId && !property.units.some((u) => u.id === unitId)) {
    return { ok: false, error: "Unit does not belong to property" };
  }

  const hits = await findConflicts({ propertyId, unitId, start, end });
  const resHits = hits.filter((h) => h.kind === "reservation");
  if (resHits.length > 0) {
    return { ok: false, error: conflictMessage(resHits) };
  }

  const block = await prisma.calendarBlock.create({
    data: { propertyId, unitId, startDate: start, endDate: end, reason },
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/reservations");
  return { ok: true, id: block.id };
}

export async function deleteBlock(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing block id" };

  const block = await prisma.calendarBlock.findFirst({
    where: { id, property: { organizationId: session.org.id } },
  });
  if (!block) return { ok: false, error: "Block not found" };

  await prisma.calendarBlock.delete({ where: { id } });
  revalidatePath("/dashboard/calendar");
  return { ok: true, id };
}

export async function createReservation(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const propertyId = String(formData.get("propertyId") ?? "");
  const unitIdRaw = String(formData.get("unitId") ?? "").trim();
  const guestName = String(formData.get("guestName") ?? "").trim();
  const guestEmail = String(formData.get("guestEmail") ?? "").trim() || null;
  const guestPhone = String(formData.get("guestPhone") ?? "").trim() || null;
  const checkInRaw = String(formData.get("checkIn") ?? "");
  const checkOutRaw = String(formData.get("checkOut") ?? "");
  const statusRaw = String(formData.get("status") ?? "confirmed") as ReservationStatus;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!propertyId || !guestName || !checkInRaw || !checkOutRaw) {
    return { ok: false, error: "Property, guest name, and dates are required" };
  }

  const status: ReservationStatus = RESERVATION_STATUSES.includes(statusRaw)
    ? statusRaw
    : "confirmed";

  let checkIn: Date;
  let checkOut: Date;
  try {
    checkIn = parseDateInput(checkInRaw);
    checkOut = parseDateInput(checkOutRaw);
  } catch {
    return { ok: false, error: "Invalid dates" };
  }
  if (!(checkOut > checkIn)) {
    return { ok: false, error: "Check-out must be after check-in" };
  }

  let property;
  try {
    property = await assertOrgProperty(session.org.id, propertyId);
  } catch {
    return { ok: false, error: "Property not found" };
  }

  const unitId = unitIdRaw || property.units[0]?.id || null;
  if (unitId && !property.units.some((u) => u.id === unitId)) {
    return { ok: false, error: "Unit does not belong to property" };
  }

  if (status === "confirmed" || status === "checked_in") {
    const hits = await findConflicts({
      propertyId,
      unitId,
      start: checkIn,
      end: checkOut,
    });
    if (hits.length > 0) {
      return { ok: false, error: conflictMessage(hits) };
    }
  }

  const guest = await prisma.guest.create({
    data: {
      organizationId: session.org.id,
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
    },
  });

  const reservation = await prisma.reservation.create({
    data: {
      organizationId: session.org.id,
      propertyId,
      unitId,
      guestId: guest.id,
      checkIn,
      checkOut,
      status,
      nightlyRateCents: property.baseRateCents,
      notes,
    },
  });

  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/calendar");
  revalidatePath(`/dashboard/reservations/${reservation.id}`);
  redirect(`/dashboard/reservations/${reservation.id}`);
}

export async function updateReservationStatus(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "") as ReservationStatus;

  if (!id || !RESERVATION_STATUSES.includes(statusRaw)) {
    return { ok: false, error: "Invalid reservation or status" };
  }

  const existing = await prisma.reservation.findFirst({
    where: { id, organizationId: session.org.id },
  });
  if (!existing) return { ok: false, error: "Reservation not found" };

  if (statusRaw === "confirmed" || statusRaw === "checked_in") {
    const hits = await findConflicts({
      propertyId: existing.propertyId,
      unitId: existing.unitId,
      start: existing.checkIn,
      end: existing.checkOut,
      excludeReservationId: existing.id,
    });
    if (hits.length > 0) {
      return { ok: false, error: conflictMessage(hits) };
    }
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: statusRaw },
  });

  revalidatePath("/dashboard/reservations");
  revalidatePath(`/dashboard/reservations/${id}`);
  revalidatePath("/dashboard/calendar");
  return { ok: true, id };
}

/** Used only for messaging; nights helper re-exported for pages. */
export async function estimateStayNights(checkIn: string, checkOut: string) {
  try {
    return nightsBetween(parseDateInput(checkIn), parseDateInput(checkOut));
  } catch {
    return 0;
  }
}
