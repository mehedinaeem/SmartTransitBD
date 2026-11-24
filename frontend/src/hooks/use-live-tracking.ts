"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { useTrackingStore } from "@/stores/tracking-store";
import { useQuery } from "@tanstack/react-query";
import { trackingApi } from "@/lib/api/tracking";
import { createDefaultGpsSource } from "@/lib/tracking/source";
import { isNewerGpsUpdate, parseGpsMessage } from "@/lib/tracking/gps";
import type {
  GpsConnection,
  GpsSource,
  GpsUpdate,
  TrackingSnapshot,
} from "@/types/tracking";
export type GpsSourceFactory = (snapshot: TrackingSnapshot) => GpsSource;
// Capture the default adapter once so clock/UI renders cannot restart its subscription.
const DEFAULT_SOURCE_FACTORY: GpsSourceFactory = createDefaultGpsSource;
/** Inject an authenticated WebSocket source factory here when hardware integration is ready. */
export function useLiveTracking(
  sourceFactory: GpsSourceFactory = DEFAULT_SOURCE_FACTORY,
) {
  // The transport belongs to this mounted session, not to clock/UI renders.
  const sourceFactoryRef = useRef(sourceFactory);
  const query = useQuery({
    queryKey: ["tracking", "snapshot"],
    queryFn: ({ signal }) => trackingApi.snapshot(signal),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const [updates, setUpdates] = useState<Record<string, GpsUpdate>>({});
  const [connection, setConnection] = useState<GpsConnection>("connecting");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!query.data) return;
    const knownIds = new Set(query.data.vehicles.map((vehicle) => vehicle.id));
    const source = sourceFactoryRef.current(query.data);
    return source.subscribe({
      onConnection: setConnection,
      onUpdate: (message) => {
        const parsed = parseGpsMessage(message);
        if (!parsed.success || !knownIds.has(parsed.data.vehicleId)) return;
        const update = parsed.data;
        setUpdates((previous) =>
          isNewerGpsUpdate(previous[update.vehicleId], update)
            ? { ...previous, [update.vehicleId]: update }
            : previous,
        );
      },
    });
  }, [query.data]);
  const remember = useTrackingStore((state) => state.remember);
  useEffect(() => {
    for (const update of Object.values(updates)) remember(update);
  }, [updates, remember]);
  const vehicles = useMemo(
    () =>
      query.data?.vehicles.map((vehicle) => {
        const update = updates[vehicle.id];
        return update
          ? {
              ...vehicle,
              position: update.position,
              recordedAt: update.recordedAt,
              speedKmh: update.speedKmh,
            }
          : vehicle;
      }) ?? [],
    [query.data, updates],
  );
  return { query, vehicles, connection, now };
}
