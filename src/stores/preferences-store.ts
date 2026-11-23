"use client";
import { create } from "zustand";
type Preferences = { name: string; notifications: boolean };
type Mode = "operator" | "passenger";
export const usePreferencesStore = create<{
  operator: Preferences;
  passenger: Preferences;
  save: (mode: Mode, preferences: Preferences) => void;
}>((set) => ({
  operator: { name: "Dhaka Transit", notifications: true },
  passenger: { name: "Demo passenger", notifications: true },
  save: (mode, preferences) => set({ [mode]: preferences }),
}));
export const useJourneyStore = create<{
  origin: string;
  destination: string;
  setJourney: (origin: string, destination: string) => void;
}>((set) => ({
  origin: "",
  destination: "",
  setJourney: (origin, destination) => set({ origin, destination }),
}));
