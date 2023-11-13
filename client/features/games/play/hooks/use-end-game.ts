import { User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { differenceInMilliseconds } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Game, TypingStats } from "../types";
import {
  calculateAccuracy,
  calculateProgress,
  calculateWpm,
  determinePosition,
} from "../utils";
import { useGameStore } from "./use-game-store";
import { usePlayersStore } from "./use-players-store";

export const useEndGame = (
  user: User,
  typingStats: TypingStats,
  game: Game,
) => {
  const { finishGame, endedAt, hasFinished, startedAt } = useGameStore();
  const { playersProgress } = usePlayersStore();
  const router = useRouter();

  const sendResult = useCallback(() => {
    socket.emit("progress", {
      progress: calculateProgress(
        typingStats.charsTyped - +!!typingStats.prevError,
        game.paragraph,
      ),
      gameId: game.id,
    });
    socket.emit("playerFinished", {
      wpm: calculateWpm(
        typingStats.charsTyped,
        differenceInMilliseconds(new Date(), new Date(startedAt!)),
      ),
      acc: calculateAccuracy(typingStats.typos, typingStats.charsTyped),
      position: determinePosition(playersProgress, user.id),
      gameId: game.id,
    });
  }, [typingStats.charsTyped, typingStats.prevError, game.paragraph, game.id]);

  useEffect(() => {
    const hasReachedTheEnd =
      !typingStats.prevError &&
      typingStats.charsTyped === game.paragraph.length;

    if (hasReachedTheEnd) {
      finishGame();
      sendResult();
      router.refresh();
    }
  }, [
    typingStats.charsTyped,
    typingStats.prevError,
    game.paragraph,
    sendResult,
  ]);

  useEffect(() => {
    const hasTimeup = !hasFinished && endedAt;
    if (hasTimeup) {
      sendResult();
      router.refresh();
    }
  }, [endedAt, hasFinished]);
};
