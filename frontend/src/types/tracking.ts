import { z } from "zod";
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coordinate = z.infer<typeof coordinateSchema>;
export const gpsUpdateSchema = z.object({
  vehicleId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  position: coordinateSchema,
  recordedAt: z.iso.datetime(),
  speedKmh: z.number().nonnegative(),
  source: z.enum(["simulator", "hardware"]),
});
export type GpsUpdate = z.infer<typeof gpsUpdateSchema>;
export type GpsConnection = "connecting" | "live" | "offline";
/** A real WebSocket adapter should validate messages and implement this same subscription. */
export interface GpsSource {
  subscribe(observer: {
    onUpdate: (update: GpsUpdate) => void;
    onConnection: (status: GpsConnection) => void;
  }): () => void;
}
const stopSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: coordinateSchema,
});
const routeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  points: z.array(coordinateSchema).min(2),
  stops: z.array(stopSchema),
  destination: stopSchema,
});
const trackingVehicleSchema = z.object({
  id: z.string(),
  routeId: z.string(),
  from: z.string(),
  to: z.string(),
  position: coordinateSchema,
  recordedAt: z.iso.datetime(),
  etaMinutes: z.number().int().nonnegative(),
  distanceKm: z.number().nonnegative(),
  speedKmh: z.number().nonnegative(),
  availableSeats: z.number().int().nonnegative(),
  nextStop: z.string(),
});
export const trackingSnapshotSchema = z.object({
  mode: z.enum(["simulation", "hardware"]),
  passengerLocation: coordinateSchema,
  vehicles: z.array(trackingVehicleSchema),
  routes: z.array(routeSchema),
});
export type TrackingSnapshot = z.infer<typeof trackingSnapshotSchema>;
export type TrackingVehicle = z.infer<typeof trackingVehicleSchema>;
export type TrackingRoute = z.infer<typeof routeSchema>;
