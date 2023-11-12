import { create } from "zustand";

interface GameSummaryModalStore {
  isModalOpen: boolean;
  wpm: number;
  acc: number;
  position: number;
  catPoints: number;
  onOpen: (payload: {
    wpm: number;
    acc: number;
    position: number;
    catPoints: number;
  }) => void;
  onClose: () => void;
}

export const useGameSummaryModal = create<GameSummaryModalStore>((set) => ({
  isModalOpen: false,
  wpm: 0,
  acc: 0,
  catPoints: 0,
  position: 0,
  onOpen: (payload) => set({ isModalOpen: true, ...payload }),
  onClose: () =>
    set({
      isModalOpen: false,
      wpm: 0,
      acc: 0,
      catPoints: 0,
      position: 0,
    }),
}));
