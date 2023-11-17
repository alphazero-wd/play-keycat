import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";
import { RankUpdateStatus } from "../types";

type State = {
  isModalOpen: boolean;
  prevRank: string | null;
  currentRank: string | null;
  status: RankUpdateStatus | null;
};

type Action = {
  onOpen: (payload: {
    prevRank: string;
    currentRank: string;
    status: RankUpdateStatus;
  }) => void;
  onClose: () => void;
};

const initialState: State = {
  isModalOpen: false,
  prevRank: null,
  currentRank: null,
  status: null,
};

const useRankUpdateModalBase = create<State & Action>((set) => ({
  ...initialState,
  onOpen: (payload) => set(() => ({ isModalOpen: true, ...payload })),
  onClose: () => set(() => initialState),
}));
export const useRankUpdateModal = createSelectors(useRankUpdateModalBase);
