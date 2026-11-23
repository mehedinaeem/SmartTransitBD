"use client";
import { useQuery } from "@tanstack/react-query";
import { transitApi } from "@/lib/api";
export const useVehicles = () =>
  useQuery({
    queryKey: ["vehicles"],
    queryFn: ({ signal }) => transitApi.getVehicles(signal),
  });
export const useRoutes = () =>
  useQuery({
    queryKey: ["routes"],
    queryFn: ({ signal }) => transitApi.getRoutes(signal),
  });
