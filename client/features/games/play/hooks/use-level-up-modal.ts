import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";

type State = {
  isModalOpen: boolean;
  currentLevel: number;
  xpsGained: number;
  xpsRequired: number;
};

type Action = {
  onOpen: (payload: Omit<State, "isModalOpen">) => void;
  onClose: () => void;
};
const initialState: State = {
  isModalOpen: false,
  currentLevel: 1,
  xpsGained: 0,
  xpsRequired: 0,
};

const useLevelUpModalBase = create<State & Action>((set) => ({
  ...initialState,
  onOpen: (payload) => set(() => ({ isModalOpen: true, ...payload })),
  onClose: () => set(() => ({ isModalOpen: false })),
}));
export const useLevelUpModal = createSelectors(useLevelUpModalBase);
