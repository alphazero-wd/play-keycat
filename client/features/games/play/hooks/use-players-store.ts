import { User } from "@/features/users/profile";
import { create } from "zustand";

type State = {
  players: User[];
  leftPlayerIds: Set<number>;
  playersPosition: Map<number, number>;
  playersProgress: Map<number, number>;
  playersWpm: Map<number, number>;
};

type Action = {
  onPlayers: (updatedPlayers: User[]) => void;
  resetPlayers: () => void;
};

export const usePlayersStore = create<State & Action>()((set) => ({
  players: [],
  playersProgress: new Map(),
  playersPosition: new Map(),
  playersWpm: new Map(),
  leftPlayerIds: new Set(),
  onPlayers: (updatedPlayers) => set({ players: updatedPlayers }),
  resetPlayers: () =>
    set({
      playersProgress: new Map(),
      playersPosition: new Map(),
      playersWpm: new Map(),
      leftPlayerIds: new Set(),
      players: [],
    }),
}));

export const updateProgress = ({
  id,
  progress,
  wpm,
  pos,
}: {
  id: number;
  progress: number;
  wpm: number;
  pos: number;
}) => {
  usePlayersStore.setState((prev) => ({
    playersProgress: new Map(prev.playersProgress).set(id, progress),
    playersWpm: new Map(prev.playersWpm).set(id, wpm),
    playersPosition: new Map(prev.playersPosition).set(id, pos),
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

export const getPlayerProgress = (id: number) => {
  const progress = usePlayersStore.getState().playersProgress.get(id);
  return progress || 0;
};

export const getPlayerWpm = (id: number) => {
  const wpm = usePlayersStore.getState().playersWpm.get(id);
  return wpm || 0;
};

export const getPlayerPosition = (id: number) => {
  const position = usePlayersStore.getState().playersPosition.get(id);
  return position || 0;
};
