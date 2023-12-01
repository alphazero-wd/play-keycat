import { User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { useCallback, useEffect } from "react";
import {
  calculateAccuracy,
  calculateProgress,
  calculateWpm,
} from "../calculate-typing";
import { Game, TypingStats } from "../types";
import { useGameStore } from "./use-game-store";
import { determinePosition, usePlayersStore } from "./use-players-store";

export const useEndGame = (
  user: User,
  typingStats: TypingStats,
  game: Game,
) => {
  const finishGame = useGameStore.use.finishGame();
  const hasFinished = useGameStore.use.hasFinished();
  const startedAt = useGameStore.use.startedAt();
  const endedAt = useGameStore.use.endedAt();
  const leftPlayerIds = usePlayersStore.use.leftPlayerIds();

  const sendResult = useCallback(() => {
    const wpm = calculateWpm(typingStats.charsTyped, new Date(startedAt!));
    const progress = calculateProgress(
      typingStats.charsTyped - +!!typingStats.prevError,
      game.paragraph,
    );
    socket.emit("progress", {
      progress,
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
  }, [typingStats.charsTyped, typingStats.prevError, game.paragraph]);

  useEffect(() => {
    const hasTimeup = !hasFinished && endedAt;
    if (hasTimeup) {
      sendResult();
    }
  }, [endedAt, hasFinished]);
};
