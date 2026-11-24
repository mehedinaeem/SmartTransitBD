import { seatSchema } from "@/types/seats";
import { z } from "zod";
export const nearbyVehicleSchema = z.object({
  id: z.string().min(1),
  routeId: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  distanceKm: z.number().nonnegative(),
  etaMinutes: z.number().int().nonnegative(),
  availableSeats: z.number().int().nonnegative(),
  status: z.enum(["Approaching", "On Route"]),
});
export type NearbyVehicle = z.infer<typeof nearbyVehicleSchema>;
export const routeStopSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["completed", "next", "upcoming", "destination"]),
});
export const busDetailsSchema = nearbyVehicleSchema
  .extend({
    status: z.literal("On Route"),
    tripId: z.string(),
    operator: z.string(),
    speedKmh: z.number().nonnegative(),
    capacity: z.number().int().positive().max(100),
    occupiedSeats: z.number().int().nonnegative(),
    reservedSeats: z.number().int().nonnegative(),
    blockedSeats: z.number().int().nonnegative(),
    position: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    recordedAt: z.iso.datetime(),
    deviceStatus: z.enum(["Online", "Offline"]),
    locationLabel: z.string(),
    locationDescription: z.string(),
    currentAfterStopId: z.string(),
    stops: z.array(routeStopSchema).min(2),
  })
  .refine(
    (bus) =>
      bus.occupiedSeats +
        bus.availableSeats +
        bus.reservedSeats +
        bus.blockedSeats ===
      bus.capacity,
    {
      message: "Seat counts must equal capacity",
    },
  );
export type BusDetails = z.infer<typeof busDetailsSchema>;
export const seatPreviewSchema = z
  .object({
    id: z.string(),
    vehicleId: z.string(),
    from: z.string(),
    to: z.string(),
    capacity: z.literal(40),
    fare: z.number().int().nonnegative(),
    currency: z.literal("BDT"),
    travelDate: z.iso.date(),
    departureTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    seats: z.array(seatSchema).length(40),
  })
  .refine((trip) => new Set(trip.seats.map((seat) => seat.id)).size === 40, {
    message: "Seat layout must have exactly 40 unique seats",
  });
export type SeatPreview = z.infer<typeof seatPreviewSchema>;
