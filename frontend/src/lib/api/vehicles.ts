import { nearbyVehicleSchema, busDetailsSchema } from "@/types/passenger";
import { vehicleSchema } from "@/types/transit";
import { getResource, listSchema } from "./client";
export const vehiclesApi = {
  nearby: (signal?: AbortSignal) =>
    getResource("vehicles/nearby/", listSchema(nearbyVehicleSchema), signal),
  detail: (id: string, signal?: AbortSignal) =>
    getResource(
      `vehicles/${encodeURIComponent(id)}/`,
      busDetailsSchema,
      signal,
    ),
  list: (signal?: AbortSignal) =>
    getResource("vehicles/", listSchema(vehicleSchema), signal),
};
