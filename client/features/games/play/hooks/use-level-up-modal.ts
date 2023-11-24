import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";

type State = {
  isModalOpen: boolean;
  currentLevel: number;
  xpsGained: number;
};

type Action = {
  onOpen: (payload: Omit<State, "isModalOpen">) => void;
  onClose: () => void;
};
const initialState: State = {
  isModalOpen: false,
  currentLevel: 1,
  xpsGained: 0,
};

const useLevelUpModalBase = create<State & Action>((set) => ({
  ...initialState,
  onOpen: (payload) => set(() => ({ isModalOpen: true, ...payload })),
  onClose: () => set(() => initialState),
}));
export const useLevelUpModal = createSelectors(useLevelUpModalBase);
