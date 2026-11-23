import { z } from "zod";
export const vehicleSchema = z.object({
  id: z.string(),
  registration: z.string(),
  route: z.string(),
  destination: z.string(),
  status: z.enum(["Moving", "At stop", "Offline"]),
  occupancy: z.number().min(0).max(40).nullable(),
  speed: z.number(),
  lat: z.number(),
  lng: z.number(),
  updated: z.string(),
});
export type Vehicle = z.infer<typeof vehicleSchema>;
export const transitRouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  from: z.string(),
  to: z.string(),
  stops: z.number().int().positive().optional(),
  fare: z.number().nonnegative().optional(),
  duration: z.string().optional(),
  popular: z.boolean().optional(),
});
export type TransitRoute = z.infer<typeof transitRouteSchema>;
export const tripSchema = z.object({
  id: z.string(),
  routeId: z.string(),
  vehicleId: z.string(),
  departureAt: z.iso.datetime(),
  status: z.enum(["scheduled", "running", "completed", "cancelled"]),
});
export const bookingSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  seatNumber: z.number().int().positive().nullable(),
});
export const occupancySchema = z.object({
  vehicleId: z.string(),
  occupied: z.number().int().min(0),
  capacity: z.number().int().positive(),
  observedAt: z.iso.datetime(),
  source: z.enum(["simulated", "vision"]),
  confidence: z.number().min(0).max(1).nullable(),
});
export const userSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.enum(["passenger", "operator"]),
});
export const overviewSchema = z.object({
  activity: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      detail: z.string(),
      type: z.enum(["info", "warning"]),
    }),
  ),
  passengerActivity: z.array(
    z.object({ time: z.string(), passengers: z.number().min(0).max(40) }),
  ),
  averageOccupiedSeats: z.number().min(0).max(40),
  openAlerts: z.number().int().nonnegative(),
});
export type Trip = z.infer<typeof tripSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type Occupancy = z.infer<typeof occupancySchema>;
export type TransitUser = z.infer<typeof userSchema>;
