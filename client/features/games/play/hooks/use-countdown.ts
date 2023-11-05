import { create } from "zustand";

type State = {
  countdown: number;
};

type Action = {
  updateCountdown: (countdown: number) => void;
  resetCountdown: () => void;
};

export const useCountdown = create<State & Action>((set) => ({
  countdown: Infinity,
  updateCountdown: (countdown) => set({ countdown }),
  resetCountdown: () => set({ countdown: Infinity }),
}));
