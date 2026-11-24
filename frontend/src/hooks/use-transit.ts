"use client";
import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "@/lib/api/vehicles";
import { routesApi } from "@/lib/api/routes";
import { overviewApi } from "@/lib/api/overview";
export const useVehicles = () =>
  useQuery({
    queryKey: ["vehicles"],
    queryFn: ({ signal }) => vehiclesApi.list(signal),
  });
export const useRoutes = (passenger = false) =>
  useQuery({
    queryKey: ["routes", passenger ? "passenger" : "operator"],
    queryFn: ({ signal }) =>
      routesApi.list(signal, passenger ? { audience: "passenger" } : {}),
  });
export const useOverview = () =>
  useQuery({
    queryKey: ["overview"],
    queryFn: ({ signal }) => overviewApi.get(signal),
  });

export const useNearbyVehicles = () =>
  useQuery({
    queryKey: ["vehicles", "nearby"],
    queryFn: ({ signal }) => vehiclesApi.nearby(signal),
  });
export const usePopularRoutes = () =>
  useQuery({
    queryKey: ["routes", "passenger", "popular"],
    queryFn: ({ signal }) =>
      routesApi.list(signal, { audience: "passenger", popular: true }),
  });
