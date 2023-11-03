import { create } from "zustand";

interface RankUpdateModalStore {
  isModalOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useRankUpdateModal = create<RankUpdateModalStore>((set) => ({
  isModalOpen: false,
  onOpen: () => set({ isModalOpen: true }),
  onClose: () => set({ isModalOpen: false }),
}));
