import { create } from "zustand";

type State = {
  startedAt: string | null;
  hasFinished: boolean;
};

type Action = {
  endGame: () => void;
  startGame: () => void;
};

export const useGameStore = create<State & Action>()((set) => ({
  startedAt: null,
  hasFinished: false,
  startGame: () => set({ startedAt: new Date().toISOString() }),
  endGame: () => set({ hasFinished: true }),
}));
