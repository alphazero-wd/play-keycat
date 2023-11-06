import { create } from "zustand";
import { RankUpdateStatus } from "../types";

interface RankUpdateModalStore {
  isModalOpen: boolean;
  prevRank: string | null;
  currentRank: string | null;
  status: RankUpdateStatus | null;
  onOpen: (payload: {
    prevRank: string;
    currentRank: string;
    status: RankUpdateStatus;
  }) => void;
  onClose: () => void;
}

export const useRankUpdateModal = create<RankUpdateModalStore>((set) => ({
  isModalOpen: false,
  prevRank: null,
  currentRank: null,
  status: null,
  onOpen: (payload) => set({ isModalOpen: true, ...payload }),
  onClose: () =>
    set({
      isModalOpen: false,
      prevRank: null,
      currentRank: null,
      status: null,
    }),
}));
