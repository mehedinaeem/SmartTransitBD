"use client";
import { create } from "zustand";
import type { GpsUpdate } from "@/types/tracking";
/** Session-only last known fixes, retained when moving from tracking to bus details. */
export const useTrackingStore = create<{
  lastKnown: Record<string, GpsUpdate>;
  remember: (update: GpsUpdate) => void;
}>((set) => ({
  lastKnown: {},
  remember: (update) =>
    set((state) => {
      const previous = state.lastKnown[update.vehicleId];
      if (
        previous &&
        Date.parse(previous.recordedAt) > Date.parse(update.recordedAt)
      )
        return state;
      return { lastKnown: { ...state.lastKnown, [update.vehicleId]: update } };
    }),
}));
