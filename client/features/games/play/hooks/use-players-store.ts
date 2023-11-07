import { User } from "@/features/users/profile";
import { create } from "zustand";

type State = {
  players: User[];
  leftPlayerIds: Set<number>;
  playersProgress: Map<number, number>;
};

type Action = {
  onPlayers: (updatedPlayers: User[]) => void;
  clearProgress: () => void;
};

export const usePlayersStore = create<State & Action>()((set) => ({
  players: [],
  playersProgress: new Map(),
  leftPlayerIds: new Set(),
  onPlayers: (updatedPlayers) => set({ players: updatedPlayers }),
  clearProgress: () =>
    set({ playersProgress: new Map(), leftPlayerIds: new Set(), players: [] }),
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

export const onPlayerLeft = (id: number) => {
  usePlayersStore.setState((prev) => ({
    leftPlayerIds: new Set(prev.leftPlayerIds).add(id),
  }));
};

export const getProgress = (id: number) => {
  const progress = usePlayersStore.getState().playersProgress.get(id);
  return progress || 0;
};
