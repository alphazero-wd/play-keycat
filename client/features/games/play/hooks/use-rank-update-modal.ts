import { create } from "zustand";
import { RankUpdateStatus } from "../types";

interface RankUpdateModalStore {
  isModalOpen: boolean;
  fromRank: string | null;
  toRank: string | null;
  status: RankUpdateStatus | null;
  catPoints: number;
  onOpen: (
    fromRank: string,
    toRank: string,
    status: RankUpdateStatus,
    catPoints: number,
  ) => void;
  onClose: () => void;
}

export const useRankUpdateModal = create<RankUpdateModalStore>((set) => ({
  isModalOpen: false,
  fromRank: null,
  toRank: null,
  status: null,
  catPoints: 0,
  onOpen: (fromRank, toRank, status, catPoints) =>
    set({ isModalOpen: true, fromRank, toRank, status, catPoints }),
  onClose: () =>
    set({ isModalOpen: false, fromRank: null, toRank: null, status: null }),
}));
