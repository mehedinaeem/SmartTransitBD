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
