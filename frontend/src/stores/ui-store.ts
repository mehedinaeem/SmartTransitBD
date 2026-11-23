"use client";
import { create } from "zustand";
export const useUiStore = create<{
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
}));
