import type { GpsSource, TrackingSnapshot } from "@/types/tracking";
import { createDevelopmentGpsSimulator } from "@/mocks/gps-simulator";
/** Never substitute simulated GPS for a hardware-mode snapshot. Inject a socket adapter instead. */
export function createDefaultGpsSource(snapshot: TrackingSnapshot): GpsSource {
  if (snapshot.mode === "simulation")
    return createDevelopmentGpsSimulator(snapshot);
  return {
    subscribe(observer) {
      observer.onConnection("offline");
      return () => {};
    },
  };
}
