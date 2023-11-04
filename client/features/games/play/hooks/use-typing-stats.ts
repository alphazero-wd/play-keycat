import { ranks } from "@/features/data";
import { getCurrentRank } from "@/features/users/profile";
import { addSeconds, differenceInMilliseconds } from "date-fns";
import { useMemo } from "react";
import { TypingStats } from "../types";
import {
  calculateAccuracy,
  calculateAverageCPs,
  calculateCPs,
  calculateWpm,
  determinePosition,
} from "../utils";
import { useGameStore } from "./use-game-store";
import { usePlayersStore } from "./use-players-store";

export const useTypingStats = (typingStats: TypingStats, userId: number) => {
  const { startedAt } = useGameStore();
  const { players, playersProgress } = usePlayersStore();

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

  const catPoints = useMemo(() => {
    const averageRank = getCurrentRank(calculateAverageCPs(players));
    console.log({
      wpm,
      acc,
      wpmRequired: ranks[averageRank].minWpm,
      accRequired: ranks[averageRank].minAcc,
      position,
    });
    return calculateCPs(
      wpm - ranks[averageRank].minWpm,
      acc - ranks[averageRank].minAcc,
      players.length,
      position,
    );
  }, [wpm, acc, players.length, position]);

  return { wpm, acc, catPoints };
};
