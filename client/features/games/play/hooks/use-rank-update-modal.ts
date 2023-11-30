import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";
import { RankUpdateStatus } from "../types";

type State = {
  isModalOpen: boolean;
  currentRank: string | null;
  status: RankUpdateStatus | null;
};

type Action = {
  onOpen: (payload: Omit<State, "isModalOpen">) => void;
  onClose: () => void;
};

const initialState: State = {
  isModalOpen: false,
  currentRank: null,
  status: null,
};

const useRankUpdateModalBase = create<State & Action>((set) => ({
  ...initialState,
  onOpen: (payload) => set(() => ({ isModalOpen: true, ...payload })),
  onClose: () => set(() => ({ isModalOpen: false })),
}));
export const useRankUpdateModal = createSelectors(useRankUpdateModalBase);
