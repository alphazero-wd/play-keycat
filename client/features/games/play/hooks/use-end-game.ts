import { ranks } from "@/features/data";
import { useAlert } from "@/features/ui/alert";
import { User, getCurrentRank } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { differenceInMilliseconds } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { Game, TypingStats } from "../types";
import {
  calculateAccuracy,
  calculateCPs,
  calculateProgress,
  calculateWpm,
  determinePosition,
} from "../utils";
import { useGameStore } from "./use-game-store";
import {
  averagePlayerCPs,
  getProgress,
  usePlayersStore,
} from "./use-players-store";
import { useRankUpdateModal } from "./use-rank-update-modal";

export const useEndGame = (
  user: User,
  typingStats: TypingStats,
  game: Game,
  timeRemaining: number,
) => {
  const { startedAt, endGame, hasFinished } = useGameStore();
  const { players, playersProgress } = usePlayersStore();
  const router = useRouter();
  const { setAlert } = useAlert();
  const { onOpen } = useRankUpdateModal();

  const userGameHistory = useMemo(() => {
    const timeTaken = differenceInMilliseconds(
      Date.now(),
      new Date(startedAt!),
    );
    const averageRank = getCurrentRank(averagePlayerCPs);
    const acc = calculateAccuracy(typingStats.typos, typingStats.charsTyped);
    const wpm = calculateWpm(typingStats.charsTyped, timeTaken);
    return {
      wpm,
      acc,
      catPoints: calculateCPs(
        wpm - ranks[averageRank].minAcc,
        acc - ranks[averageRank].minWpm,
        players.length,
        determinePosition(playersProgress, user.id),
      ),
      gameId: game.id,
    };
  }, [
    averagePlayerCPs,
    typingStats.typos,
    typingStats.charsTyped,
    startedAt,
    playersProgress,
    user.id,
    game.id,
  ]);

  const sendResult = useCallback(() => {
    socket.emit("progress", {
      progress: calculateProgress(typingStats.charsTyped, game.paragraph),
      gameId: game.id,
    });
    if (getProgress(user.id) >= 50)
      socket.emit("playerFinished", userGameHistory);
  }, [typingStats.charsTyped, game.paragraph, userGameHistory, game.id]);

  useEffect(() => {
    const hasReachedTheEnd = typingStats.charsTyped === game.paragraph.length;
    if (hasReachedTheEnd) {
      endGame();
      sendResult();
    }
  }, [typingStats.charsTyped, game.paragraph.length, sendResult]);

  useEffect(() => {
    const hasTimeup = timeRemaining === 0;
    if (hasTimeup) {
      endGame();
      sendResult();
    }
  }, [timeRemaining, sendResult]);

  useEffect(() => {
    if (
      getCurrentRank(user.catPoints + userGameHistory.catPoints) !==
      getCurrentRank(user.catPoints)
    )
      onOpen();
  }, [user.catPoints, userGameHistory.catPoints]);

  useEffect(() => {
    if (hasFinished) {
      const timeout = setTimeout(() => {
        if (getProgress(user.id) >= 50)
          router.push(`/games/${game.id}/history`);
        else {
          setAlert(
            "info",
            "Your progress is not saved because it is below 50%",
          );
          router.push("/");
        }
        router.refresh();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [hasFinished]);

  return { userGameHistory };
};
