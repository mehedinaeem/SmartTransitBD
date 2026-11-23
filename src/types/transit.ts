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
  stops: z.number().int().positive(),
  fare: z.number().nonnegative(),
  duration: z.string(),
});
export type TransitRoute = z.infer<typeof transitRouteSchema>;
