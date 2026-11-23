import { trackingSnapshotSchema } from "@/types/tracking";
import { getResource } from "./client";
export const trackingApi = {
  snapshot: (signal?: AbortSignal) =>
    getResource("tracking/", trackingSnapshotSchema, signal),
};
