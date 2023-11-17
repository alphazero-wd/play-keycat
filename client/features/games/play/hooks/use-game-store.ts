import { createSelectors } from "@/lib/create-selectors";
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

const initialState: State = {
  hasFinished: false,
  startedAt: null,
  endedAt: null,
};

const useGameStoreBase = create<State & Action>()((set) => ({
  ...initialState,
  startGame: ({ startedAt }) => set(() => ({ startedAt })),
  finishGame: () => set(() => ({ hasFinished: true })),
  endGame: ({ endedAt }) => set(() => ({ endedAt })),
  resetGame: () => set(() => initialState),
}));
export const useGameStore = createSelectors(useGameStoreBase);
