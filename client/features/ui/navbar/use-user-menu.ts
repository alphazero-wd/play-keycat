"use client";
import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";

type State = {
  catPoints: number;
};

type Action = {
  setCatPoints: (catPoints: number) => void;
};

const useUserMenuBase = create<State & Action>((set) => ({
  catPoints: 0,
  setCatPoints: (catPoints) => set({ catPoints }),
}));
export const useUserMenu = createSelectors(useUserMenuBase);
