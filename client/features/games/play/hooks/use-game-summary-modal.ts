import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";

type State = {
  isModalOpen: boolean;
  wpm: number;
  acc: number;
  position: number;
  catPoints: number;
  totalXPsBonus: number; // dismiss xps subtracted upon level up
  newXPsGained: number;
};

type Action = {
  onOpen: (payload: Omit<State, "isModalOpen">) => void;
  onClose: () => void;
};
const initialState: State = {
  isModalOpen: false,
  wpm: 0,
  acc: 0,
  catPoints: 0,
  position: 0,
  totalXPsBonus: 0,
  newXPsGained: 0,
};

const useGameSummaryModalBase = create<State & Action>((set) => ({
  ...initialState,
  onOpen: (payload) => set(() => ({ isModalOpen: true, ...payload })),
  onClose: () => set(() => ({ isModalOpen: false })),
}));
export const useGameSummaryModal = createSelectors(useGameSummaryModalBase);
