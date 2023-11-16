import { User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { useCallback, useEffect } from "react";
import { Game, TypingStats } from "../types";
import { calculateAccuracy, calculateProgress, calculateWpm } from "../utils";
import { useCountdown } from "./use-countdown";
import { useGameStore } from "./use-game-store";
import { determinePosition, usePlayersStore } from "./use-players-store";

export const useEndGame = (
  user: User,
  typingStats: TypingStats,
  game: Game,
) => {
  const { finishGame, endedAt, hasFinished, startedAt } = useGameStore();
  const { countdown } = useCountdown();
  const { leftPlayerIds } = usePlayersStore();

  const sendResult = useCallback(() => {
    const wpm = calculateWpm(typingStats.charsTyped, new Date(startedAt!));
    socket.emit("progress", {
      progress: calculateProgress(
        typingStats.charsTyped - +!!typingStats.prevError,
        game.paragraph,
      ),
      wpm,
      gameId: game.id,
    });
    socket.emit("playerFinished", {
      wpm,
      acc: calculateAccuracy(typingStats.typos, typingStats.charsTyped),
      position: determinePosition(user.id),
      gameId: game.id,
      leftPlayersCount: leftPlayerIds.size,
    });
  }, [
    user.id,
    typingStats.charsTyped,
    typingStats.typos,
    typingStats.prevError,
    leftPlayerIds.size,
    game.paragraph,
    game.id,
  ]);

  useEffect(() => {
    const hasReachedTheEnd =
      !typingStats.prevError &&
      typingStats.charsTyped === game.paragraph.length;

    if (hasReachedTheEnd) {
      finishGame();
      sendResult();
    }
  }, [
    typingStats.charsTyped,
    typingStats.prevError,
    game.paragraph,
    sendResult,
  ]);

  useEffect(() => {
    const hasTimeup = !hasFinished && countdown === 0 && endedAt;
    if (hasTimeup) {
      sendResult();
    }
  }, [endedAt, hasFinished, countdown]);
};
