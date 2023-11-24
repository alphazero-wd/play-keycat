"use client";
import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";

type State = {
  catPoints: number;
  currentLevel: number;
  xpsGained: number;
};

type Action = {
  setCatPoints: (catPoints: number) => void;
  updateXPs: (xpsGained: number) => void;
  levelUp: (newLevel: number) => void;
};

const useUserMenuBase = create<State & Action>((set) => ({
  catPoints: 0,
  currentLevel: 1,
  xpsGained: 0,
  setCatPoints: (catPoints) => set({ catPoints }),
  updateXPs: (xpsGained) => set({ xpsGained }),
  levelUp: (newLevel) => set({ currentLevel: newLevel }),
}));
export const useUserMenu = createSelectors(useUserMenuBase);
