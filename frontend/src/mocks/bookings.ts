import { createDemoTickets } from "./tickets";
import { z } from "zod";
import {
  confirmedBookingSchema,
  createBookingSchema,
  type ConfirmedBooking,
} from "@/types/booking";
import type { BookingService } from "@/lib/booking-service";
import type { PaymentAdapter } from "@/lib/payments/types";
import { mockPaymentAdapter } from "./payments";
import { tripsApi } from "@/lib/api/trips";
import { getAvailableSeat } from "@/lib/seats";
import { ApiError } from "@/lib/api/client";
const STORAGE_KEY = "smarttransit.demo-bookings.v1";
const recordSchema = z.array(
  z.object({ idempotencyKey: z.string(), booking: confirmedBookingSchema }),
);
type RecordEntry = z.infer<typeof recordSchema>[number];
let memory: RecordEntry[] = [];
let memoryOnly = false;
let queue: Promise<unknown> = Promise.resolve();
function readRecords(): RecordEntry[] {
  if (typeof window === "undefined") return [];
  if (memoryOnly) return memory;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memory = [];
      return memory;
    }
    if (raw) {
      const parsed = recordSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        memory = parsed.data;
        return memory;
      }
    }
  } catch {
    /* Browser storage is optional; the mounted session can use memory. */
  }
  return memory;
}
function writeRecords(records: RecordEntry[]) {
  memory = records;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    memoryOnly = true;
    /* Memory remains available if storage is disabled. */
  }
}
export function createMockBookingService(
  payment: PaymentAdapter = mockPaymentAdapter,
): BookingService {
  return {
    create(input, options) {
      const operation = queue.then(async () => {
        const request = createBookingSchema.parse(input);
        const records = readRecords();
        const existing = records.find(
          (record) => record.idempotencyKey === options.idempotencyKey,
        );
        if (existing) return existing.booking;
        if (
          records.some(
            (record) =>
              record.booking.tripId === request.tripId &&
              record.booking.seatId === request.seatId,
          )
        )
          throw new ApiError(
            409,
            "This seat already has a demo booking in this tab. Choose another seat.",
          );
        const trip = await tripsApi.seats(request.tripId);
        if (!getAvailableSeat(trip.seats, request.seatId))
          throw new ApiError(
            409,
            "This seat is no longer available. Please choose another seat.",
          );
        await new Promise((resolve) => setTimeout(resolve, 900));
        const result = await payment.prepare({
          method: request.paymentMethod,
          amount: trip.fare,
          currency: "BDT",
          idempotencyKey: options.idempotencyKey,
        });
        if (result.status !== "SIMULATED")
          throw new Error(
            "The mock booking workflow accepts simulated payments only.",
          );
        const next =
          Math.max(
            182,
            ...records.map((record) =>
              Number(record.booking.bookingId.split("-").at(-1)),
            ),
          ) + 1;
        const booking: ConfirmedBooking = confirmedBookingSchema.parse({
          bookingId: `STB-2026-${String(next).padStart(5, "0")}`,
          status: "CONFIRMED",
          tripId: trip.id,
          vehicleId: trip.vehicleId,
          from: trip.from,
          to: trip.to,
          travelDate: trip.travelDate,
          departureTime: trip.departureTime,
          seatId: request.seatId,
          fare: trip.fare,
          currency: "BDT",
          passenger: request.passenger,
          paymentMethod: request.paymentMethod,
          paymentStatus: result.status,
          paymentReference: result.reference,
          isDemo: true,
          createdAt: new Date().toISOString(),
        });
        writeRecords([
          ...records,
          { idempotencyKey: options.idempotencyKey, booking },
        ]);
        return booking;
      });
      queue = operation.catch(() => {});
      return operation;
    },
    async get(id) {
      return (
        readRecords().find((record) => record.booking.bookingId === id)
          ?.booking ??
        createDemoTickets().find((ticket) => ticket.bookingId === id) ??
        null
      );
    },
    async tickets() {
      const tickets = new Map(
        createDemoTickets().map((ticket) => [ticket.bookingId, ticket]),
      );
      for (const record of readRecords())
        tickets.set(record.booking.bookingId, record.booking);
      return [...tickets.values()];
    },
    async confirmed() {
      return readRecords()
        .map((record) => record.booking)
        .reverse();
    },
  };
}
