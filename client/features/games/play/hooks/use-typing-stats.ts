import { User } from "@/features/users/profile";
import { differenceInMilliseconds } from "date-fns";
import { useMemo } from "react";
import { TypingStats } from "../types";
import { calculateWpm, determinePosition } from "../utils";
import { useGameStore } from "./use-game-store";
import { usePlayersStore } from "./use-players-store";

export const useTypingStats = (typingStats: TypingStats, user: User) => {
  const startedAt = useGameStore((state) => state.startedAt);
  const playersProgress = usePlayersStore((state) => state.playersProgress);

  const wpm = useMemo(() => {
    const timeTaken = differenceInMilliseconds(
      new Date(),
      new Date(startedAt!),
    );
    return calculateWpm(typingStats.charsTyped, timeTaken);
  }, [typingStats.charsTyped, startedAt]);
  const pos = useMemo(() => {
    return determinePosition(playersProgress, user.id);
  }, [playersProgress, user.id]);
  return { wpm, pos };
};
