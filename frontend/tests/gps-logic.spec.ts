import { test, expect } from "@playwright/test";
import {
  animatePosition,
  interpolateCoordinate,
  type FrameClock,
} from "../src/lib/tracking/interpolate";
import { isNewerGpsUpdate, parseGpsMessage } from "../src/lib/tracking/gps";
import { createDevelopmentGpsSimulator } from "../src/mocks/gps-simulator";
import {
  createTrackingSnapshot,
  bus06SimulationPath,
} from "../src/mocks/tracking";
import { createDefaultGpsSource } from "../src/lib/tracking/source";
import type { GpsUpdate, Coordinate } from "../src/types/tracking";

test("GPS contracts reject malformed and out-of-order hardware messages", () => {
  const update: GpsUpdate = {
    vehicleId: "BUS-06",
    sequence: 2,
    position: { lat: 24.58, lng: 90.38 },
    recordedAt: "2026-11-23T10:00:00Z",
    speedKmh: 32,
    source: "hardware",
  };
  expect(parseGpsMessage(update).success).toBe(true);
  expect(
    parseGpsMessage({ ...update, position: { lat: 190, lng: 90.38 } }).success,
  ).toBe(false);
  expect(isNewerGpsUpdate(update, { ...update, sequence: 1 })).toBe(false);
  expect(
    isNewerGpsUpdate(update, {
      ...update,
      sequence: 3,
      recordedAt: "2026-11-23T09:59:00Z",
    }),
  ).toBe(false);
  expect(isNewerGpsUpdate(update, { ...update, sequence: 3 })).toBe(true);
});
test("Interpolation renders intermediate positions, supports cancellation and reduced motion", () => {
  let frame: (time: number) => void = () => {};
  let cancelled = false;
  const positions: Coordinate[] = [];
  const clock: FrameClock = {
    now: () => 0,
    request: (callback) => {
      frame = callback;
      return 1;
    },
    cancel: () => {
      cancelled = true;
    },
  };
  const stop = animatePosition(
    { lat: 0, lng: 0 },
    { lat: 10, lng: 20 },
    (position) => positions.push(position),
    { durationMs: 2800, clock },
  );
  frame(1400);
  expect(positions.at(-1)).toEqual({ lat: 5, lng: 10 });
  frame(2800);
  expect(positions.at(-1)).toEqual({ lat: 10, lng: 20 });
  stop();
  expect(cancelled).toBe(true);
  const count = positions.length;
  frame(3000);
  expect(positions).toHaveLength(count);
  expect(
    interpolateCoordinate({ lat: 0, lng: 0 }, { lat: 10, lng: 20 }, 5),
  ).toEqual({ lat: 10, lng: 20 });
  let requested = false;
  animatePosition(
    { lat: 0, lng: 0 },
    { lat: 10, lng: 20 },
    (position) => positions.push(position),
    {
      reducedMotion: true,
      clock: {
        ...clock,
        request: () => {
          requested = true;
          return 1;
        },
      },
    },
  );
  expect(requested).toBe(false);
  expect(positions.at(-1)).toEqual({ lat: 10, lng: 20 });
});
test("GPS simulator emits every three seconds, reverses without teleporting and stops on unsubscribe", () => {
  let tick = () => {};
  let delay = 0;
  let stopped = false;
  const messages: GpsUpdate[] = [];
  const source = createDevelopmentGpsSimulator(createTrackingSnapshot(), {
    now: () => Date.parse("2026-11-23T10:00:00Z"),
    schedule: (callback, interval) => {
      tick = callback;
      delay = interval;
      return () => {
        stopped = true;
      };
    },
  });
  const unsubscribe = source.subscribe({
    onConnection: () => {},
    onUpdate: (message) => messages.push(message),
  });
  expect(delay).toBe(3000);
  tick();
  expect(messages[0].position).toEqual(bus06SimulationPath[1]);
  for (let i = 1; i < bus06SimulationPath.length; i++) tick();
  expect(messages.at(-1)?.position).toEqual(bus06SimulationPath.at(-2));
  expect(messages.at(-1)?.sequence).toBe(bus06SimulationPath.length);
  unsubscribe();
  expect(stopped).toBe(true);
});
test("Hardware mode cannot silently start the development simulator", () => {
  const snapshot = createTrackingSnapshot();
  snapshot.mode = "hardware";
  let connection = "";
  const messages: GpsUpdate[] = [];
  createDefaultGpsSource(snapshot).subscribe({
    onConnection: (status) => {
      connection = status;
    },
    onUpdate: (message) => messages.push(message),
  })();
  expect(connection).toBe("offline");
  expect(messages).toHaveLength(0);
});
