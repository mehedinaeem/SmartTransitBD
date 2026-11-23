import type { GpsSource, GpsUpdate, TrackingSnapshot } from "@/types/tracking";
import { bus06SimulationPath } from "./tracking";
export const GPS_SAMPLE_INTERVAL_MS = 3000;
export interface SimulationClock {
  now: () => number;
  schedule: (callback: () => void, delayMs: number) => () => void;
}
const browserClock: SimulationClock = {
  now: () => Date.now(),
  schedule: (callback, delayMs) => {
    const timer = setInterval(callback, delayMs);
    return () => clearInterval(timer);
  },
};
/** Owned by a single subscription; unsubscribing stops every timer. No map dependency. */
export function createDevelopmentGpsSimulator(
  snapshot: TrackingSnapshot,
  clock: SimulationClock = browserClock,
): GpsSource {
  return {
    subscribe(observer) {
      let index = 0;
      let direction = 1;
      let sequence = 0;
      const vehicle = snapshot.vehicles.find(
        (vehicle) => vehicle.id === "BUS-06",
      );
      observer.onConnection(vehicle ? "live" : "offline");
      if (!vehicle) return () => {};
      const cancel = clock.schedule(() => {
        if (index === bus06SimulationPath.length - 1) direction = -1;
        else if (index === 0) direction = 1;
        index += direction;
        const update: GpsUpdate = {
          vehicleId: vehicle.id,
          sequence: ++sequence,
          position: bus06SimulationPath[index],
          recordedAt: new Date(clock.now()).toISOString(),
          speedKmh: 32,
          source: "simulator",
        };
        observer.onUpdate(update);
      }, GPS_SAMPLE_INTERVAL_MS);
      return () => {
        cancel();
      };
    },
  };
}
