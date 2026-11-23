import { occupancySchema } from "@/types/transit";
import { getResource, listSchema } from "./client";
export const occupancyApi = {
  list: (signal?: AbortSignal) =>
    getResource("occupancy/", listSchema(occupancySchema), signal),
};
