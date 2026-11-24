import { seatPreviewSchema } from "@/types/passenger";
import { tripSchema } from "@/types/transit";
import { getResource, listSchema } from "./client";
export const tripsApi = {
  seats: (tripId: string, signal?: AbortSignal) =>
    getResource(
      `trips/${encodeURIComponent(tripId)}/`,
      seatPreviewSchema,
      signal,
    ),
  list: (signal?: AbortSignal) =>
    getResource("trips/", listSchema(tripSchema), signal),
};
