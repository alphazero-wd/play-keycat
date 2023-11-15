import { User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { useCallback, useEffect } from "react";
import { Game, TypingStats } from "../types";
import {
  calculateAccuracy,
  calculateProgress,
  determinePosition,
} from "../utils";
import { useGameStore } from "./use-game-store";
import { usePlayersStore } from "./use-players-store";
import { useTypingStats } from "./use-typing-stats";

export const useEndGame = (
  user: User,
  typingStats: TypingStats,
  game: Game,
) => {
  const { finishGame, endedAt, hasFinished } = useGameStore();
  const { playersProgress, leftPlayerIds } = usePlayersStore();
  const { wpm, pos } = useTypingStats(typingStats, user);

  const sendResult = useCallback(() => {
    socket.emit("progress", {
      progress: calculateProgress(
        typingStats.charsTyped - +!!typingStats.prevError,
        game.paragraph,
      ),
      wpm,
      pos,
      gameId: game.id,
    });
    socket.emit("playerFinished", {
      wpm,
      acc: calculateAccuracy(typingStats.typos, typingStats.charsTyped),
      position: determinePosition(playersProgress, user.id),
      gameId: game.id,
      leftPlayersCount: leftPlayerIds.size,
    });
  }, [
    wpm,
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
    const hasTimeup = !hasFinished && endedAt;
    if (hasTimeup) {
      sendResult();
    }
  }, [endedAt, hasFinished]);
};
