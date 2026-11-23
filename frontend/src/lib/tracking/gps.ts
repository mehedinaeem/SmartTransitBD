import { gpsUpdateSchema, type GpsUpdate } from "@/types/tracking";
export const STALE_GPS_AFTER_MS = 15000;
/** A future socket transport can pass decoded JSON here before delivering updates. */
export function parseGpsMessage(message: unknown) {
  return gpsUpdateSchema.safeParse(message);
}
export function isNewerGpsUpdate(
  previous: GpsUpdate | undefined,
  next: GpsUpdate,
) {
  return (
    !previous ||
    (next.vehicleId === previous.vehicleId &&
      next.sequence > previous.sequence &&
      Date.parse(next.recordedAt) >= Date.parse(previous.recordedAt))
  );
}
export function gpsAgeSeconds(recordedAt: string, now: number) {
  return Math.max(0, Math.floor((now - Date.parse(recordedAt)) / 1000));
}
