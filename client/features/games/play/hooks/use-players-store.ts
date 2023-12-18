import { User } from "@/features/users/profile";
import { createSelectors } from "@/lib/create-selectors";
import { create } from "zustand";

type State = {
  players: User[];
  leftPlayerIds: Set<string>;
  playersPosition: Map<string, number>;
  playersProgress: Map<string, number>;
  playersWpm: Map<string, number>;
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

const usePlayersStoreBase = create<State & Action>()((set) => ({
  ...initialState,
  onPlayers: (updatedPlayers) => {
    set(() => {
      const playersProgress = new Map();
      for (let player of updatedPlayers) playersProgress.set(player.id, 0);

      return {
        players: updatedPlayers,
        playersProgress,
      };
    });
  },

  resetPlayers: () => set(() => initialState),
}));

export const updateProgress = ({
  id,
  progress,
  wpm,
}: {
  id: string;
  progress: number;
  wpm: number;
}) => {
  usePlayersStoreBase.setState((prev) => ({
    playersProgress: new Map(prev.playersProgress).set(id, progress),
    playersWpm: new Map(prev.playersWpm).set(id, wpm),
  }));
};

export const updatePosition = ({
  id,
  position,
}: {
  id: string;
  position: number;
}) => {
  usePlayersStoreBase.setState((prev) => ({
    playersPosition: new Map(prev.playersPosition).set(id, position),
  }));
};

export const addLeftPlayer = (id: string) => {
  usePlayersStoreBase.setState((prev) => ({
    leftPlayerIds: new Set(prev.leftPlayerIds).add(id),
  }));
};

export const getPlayerProgress = (id: string) => {
  const progress = usePlayersStoreBase.getState().playersProgress.get(id);
  return progress || 0;
};

export const getPlayerWpm = (id: string) => {
  const wpm = usePlayersStoreBase.getState().playersWpm.get(id);
  return wpm || 0;
};

export const getPlayerPosition = (id: string) => {
  const position = usePlayersStoreBase.getState().playersPosition.get(id);
  return position || 0;
};

export const determinePosition = (id: string) => {
  const playersProgress = usePlayersStoreBase.getState().playersProgress;
  const progress = playersProgress.values();
  const sortedProgressSetDesc = Array.from(new Set(progress)).sort(
    (a, b) => b - a,
  );
  const position = sortedProgressSetDesc.findIndex(
    (prog) => playersProgress.get(id) === prog,
  );
  return position === -1 ? sortedProgressSetDesc.length : position + 1;
};

export const usePlayersStore = createSelectors(usePlayersStoreBase);
