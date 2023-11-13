import { User } from "@/features/users/profile";
import { create } from "zustand";

type State = {
  players: User[];
  leftPlayerIds: Set<number>;
  playersPosition: Map<number, number>;
  playersProgress: Map<number, number>;
};

type Action = {
  onPlayers: (updatedPlayers: User[]) => void;
  resetPlayers: () => void;
};

export const usePlayersStore = create<State & Action>()((set) => ({
  players: [],
  playersProgress: new Map(),
  playersPosition: new Map(),
  leftPlayerIds: new Set(),
  onPlayers: (updatedPlayers) => set({ players: updatedPlayers }),
  resetPlayers: () =>
    set({
      playersProgress: new Map(),
      playersPosition: new Map(),
      leftPlayerIds: new Set(),
      players: [],
    }),
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

export const updatePosition = ({
  id,
  position,
}: {
  id: number;
  position: number;
}) => {
  usePlayersStore.setState((prev) => ({
    playersPosition: new Map(prev.playersPosition).set(id, position),
  }));
};

export const addLeftPlayer = (id: number) => {
  usePlayersStore.setState((prev) => ({
    leftPlayerIds: new Set(prev.leftPlayerIds).add(id),
  }));
};

export const getProgress = (id: number) => {
  const progress = usePlayersStore.getState().playersProgress.get(id);
  return progress || 0;
};

export const getPosition = (id: number) => {
  const position = usePlayersStore.getState().playersPosition.get(id);
  return position || 0;
};
