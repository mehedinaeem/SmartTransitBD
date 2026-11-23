import { tripSchema } from "@/types/transit";
import { getResource, listSchema } from "./client";
export const tripsApi = {
  list: (signal?: AbortSignal) =>
    getResource("trips/", listSchema(tripSchema), signal),
};
