import { create } from "zustand";

type State = {
  startedAt: string | null;
  endedAt: string | null;
  hasFinished: boolean;
};

type Action = {
  finishGame: () => void;
  endGame: (payload: { endedAt: string }) => void;
  startGame: (payload: { startedAt: string }) => void;
  resetGame: () => void;
};

export const useGameStore = create<State & Action>()((set) => ({
  startedAt: null,
  endedAt: null,
  hasFinished: false,
  startGame: ({ startedAt }) => set({ startedAt }),
  finishGame: () => set({ hasFinished: true }),
  endGame: ({ endedAt }) => set({ endedAt }),
  resetGame: () => set({ hasFinished: false, startedAt: null, endedAt: null }),
}));
