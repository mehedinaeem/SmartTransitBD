import { transitRouteSchema } from "@/types/transit";
import { getResource, listSchema } from "./client";
export type RouteFilters = { audience?: "passenger"; popular?: boolean };
export const routesApi = {
  list: (signal?: AbortSignal, filters: RouteFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.audience) params.set("audience", filters.audience);
    if (filters.popular) params.set("popular", "true");
    return getResource(
      `routes/${params.size ? `?${params}` : ""}`,
      listSchema(transitRouteSchema),
      signal,
    );
  },
};
