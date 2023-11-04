import { User } from "@/features/users/profile";
import { create } from "zustand";

type State = {
  players: User[];
  playersProgress: Map<number, number>;
};

type Action = {
  onPlayers: (updatedPlayers: User[]) => void;
  clearProgress: () => void;
};

export const usePlayersStore = create<State & Action>()((set) => ({
  players: [],
  playersProgress: new Map(),
  onPlayers: (updatedPlayers) => set({ players: updatedPlayers }),
  clearProgress: () => set({ playersProgress: new Map(), players: [] }),
}));

export const updateProgress = ({
  id,
  progress,
}: {
  id: number;
  progress: number;
}) => {
  usePlayersStore.setState((prev) => ({
    playersProgress: new Map(prev.playersProgress).set(id, progress),
  }));
};

export const getProgress = (id: number) => {
  const progress = usePlayersStore.getState().playersProgress.get(id);
  return progress || 0;
};
