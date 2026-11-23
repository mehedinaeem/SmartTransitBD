import type { Coordinate } from "@/types/tracking";
export interface FrameClock {
  now: () => number;
  request: (callback: (time: number) => void) => number;
  cancel: (id: number) => void;
}
const browserClock: FrameClock = {
  now: () => performance.now(),
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
};
export function interpolateCoordinate(
  from: Coordinate,
  to: Coordinate,
  progress: number,
): Coordinate {
  const t = Math.min(1, Math.max(0, progress));
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}
/** Map-independent animation. Call cancel before retargeting from the current displayed position. */
export function animatePosition(
  from: Coordinate,
  to: Coordinate,
  onFrame: (position: Coordinate) => void,
  options: {
    durationMs?: number;
    reducedMotion?: boolean;
    clock?: FrameClock;
  } = {},
): () => void {
  const {
    durationMs = 2800,
    reducedMotion = false,
    clock = browserClock,
  } = options;
  if (reducedMotion || durationMs <= 0) {
    onFrame(to);
    return () => {};
  }
  const start = clock.now();
  let cancelled = false;
  let frame = 0;
  const tick = (time: number) => {
    if (cancelled) return;
    const progress = Math.min(1, (time - start) / durationMs);
    onFrame(interpolateCoordinate(from, to, progress));
    if (progress < 1) frame = clock.request(tick);
  };
  frame = clock.request(tick);
  return () => {
    cancelled = true;
    clock.cancel(frame);
  };
}
