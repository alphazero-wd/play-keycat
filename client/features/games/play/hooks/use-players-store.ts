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

const initialState: State = {
  players: [],
  playersProgress: new Map(),
  playersPosition: new Map(),
  playersWpm: new Map(),
  leftPlayerIds: new Set(),
};

export const usePlayersStore = create<State & Action>()((set) => ({
  ...initialState,
  onPlayers: (updatedPlayers) => set({ players: updatedPlayers }),
  resetPlayers: () => set(initialState),
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

export const determinePosition = (id: number) => {
  // Input: {1: 50, 2: 75, 3: 60, 4: 75, 5: 100}, playerId = 3
  // Set + Sorted DESC: [100, 75, 60, 50]
  // Output: 3

  const playersProgress = usePlayersStore.getState().playersProgress;
  const progress = playersProgress.values();
  const sortedProgressSetDesc = Array.from(new Set(progress)).sort(
    (a, b) => b - a,
  );
  const position = sortedProgressSetDesc.findIndex(
    (prog) => playersProgress.get(id) === prog,
  );
  return position === -1 ? sortedProgressSetDesc.length : position + 1;
};
