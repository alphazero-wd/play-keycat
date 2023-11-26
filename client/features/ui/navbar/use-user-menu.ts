"use client";
import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";

type State = {
  catPoints: number;
  currentLevel: number;
  xpsGained: number;
  xpsRequired: number;
};

type Action = {
  setCatPoints: (catPoints: number) => void;
  setXPs: (xpsGained: number) => void;
  setLevel: (newLevel: number) => void;
  setXPsRequired: (xpsRequired: number) => void;
};

const useUserMenuBase = create<State & Action>((set) => ({
  catPoints: 0,
  currentLevel: 1,
  xpsGained: 0,
  xpsRequired: 0,
  setCatPoints: (catPoints) => set(() => ({ catPoints })),
  setXPs: (xpsGained) => set(() => ({ xpsGained })),
  setLevel: (newLevel) => set(() => ({ currentLevel: newLevel })),
  setXPsRequired: (xpsRequired) => set(() => ({ xpsRequired })),
}));
export const useUserMenu = createSelectors(useUserMenuBase);
