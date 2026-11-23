import { overviewSchema } from "@/types/transit";
import { getResource } from "./client";
export const overviewApi = {
  get: (signal?: AbortSignal) =>
    getResource("overview/", overviewSchema, signal),
};
