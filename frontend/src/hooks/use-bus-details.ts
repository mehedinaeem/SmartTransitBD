"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "@/lib/api/vehicles";
import { tripsApi } from "@/lib/api/trips";
import { ApiError } from "@/lib/api/client";
import { useTrackingStore } from "@/stores/tracking-store";
import { gpsAgeSeconds } from "@/lib/tracking/gps";
export function useBusDetails(id: string) {
  const query = useQuery({
    queryKey: ["vehicles", "details", id],
    queryFn: ({ signal }) => vehiclesApi.detail(id, signal),
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 404) && count < 1,
  });
  const gps = useTrackingStore((state) => state.lastKnown[id]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const latest =
    gps &&
    query.data &&
    Date.parse(gps.recordedAt) >= Date.parse(query.data.recordedAt)
      ? gps
      : undefined;
  const recordedAt = latest?.recordedAt ?? query.data?.recordedAt;
  return {
    query,
    position: latest?.position ?? query.data?.position,
    speedKmh: latest?.speedKmh ?? query.data?.speedKmh,
    recordedAt,
    age: recordedAt ? gpsAgeSeconds(recordedAt, now) : 0,
  };
}
export const useSeatPreview = (tripId: string) =>
  useQuery({
    queryKey: ["trips", "seats", tripId],
    queryFn: ({ signal }) => tripsApi.seats(tripId, signal),
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 404) && count < 1,
  });
