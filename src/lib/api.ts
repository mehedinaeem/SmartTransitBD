import { z } from "zod";
import {
  vehicleSchema,
  transitRouteSchema,
  type TransitRoute,
  type Vehicle,
} from "@/types/transit";
export interface TransitApi {
  getVehicles(signal?: AbortSignal): Promise<Vehicle[]>;
  getRoutes(signal?: AbortSignal): Promise<TransitRoute[]>;
}
// Replace this adapter with an authenticated HTTP implementation at integration time.
export const transitApi: TransitApi = {
  async getVehicles(signal) {
    const response = await fetch("/api/mock/vehicles", { signal });
    if (!response.ok) throw new Error("Unable to load vehicles");
    return z.array(vehicleSchema).parse(await response.json());
  },
  async getRoutes(signal) {
    const response = await fetch("/api/mock/routes", { signal });
    if (!response.ok) throw new Error("Unable to load routes");
    return z.array(transitRouteSchema).parse(await response.json());
  },
};
