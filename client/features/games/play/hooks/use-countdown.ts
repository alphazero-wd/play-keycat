import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";

type State = {
  countdown: number;
};

type Action = {
  updateCountdown: (countdown: number) => void;
  resetCountdown: () => void;
};

const useCountdownBase = create<State & Action>((set) => ({
  countdown: Infinity,
  updateCountdown: (countdown) => set(() => ({ countdown })),
  resetCountdown: () => set(() => ({ countdown: Infinity })),
}));
export const useCountdown = createSelectors(useCountdownBase);
