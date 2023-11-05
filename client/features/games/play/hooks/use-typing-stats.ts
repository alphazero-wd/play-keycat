import { addSeconds, differenceInMilliseconds } from "date-fns";
import { useMemo } from "react";
import { TypingStats } from "../types";
import { calculateAccuracy, calculateWpm, determinePosition } from "../utils";
import { useGameStore } from "./use-game-store";
import { usePlayersStore } from "./use-players-store";

export const useTypingStats = (typingStats: TypingStats, userId: number) => {
  const { startedAt } = useGameStore();
  const { playersProgress } = usePlayersStore();

  const wpm = useMemo(() => {
    const timeTaken = differenceInMilliseconds(
      new Date(),
      addSeconds(new Date(startedAt!), 10),
    );
    return calculateWpm(typingStats.charsTyped, timeTaken);
  }, [typingStats.charsTyped, startedAt]);

  const acc = useMemo(() => {
    return calculateAccuracy(typingStats.typos, typingStats.charsTyped);
  }, [typingStats.typos, typingStats.charsTyped]);

  const position = useMemo(() => {
    return determinePosition(playersProgress, userId);
  }, [playersProgress, userId]);

  return { wpm, acc, position };
};
