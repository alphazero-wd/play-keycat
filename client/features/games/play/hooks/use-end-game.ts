import { useAlert } from "@/features/ui/alert";
import { User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Game, TypingStats } from "../types";
import { calculateProgress } from "../utils";
import { useGameStore } from "./use-game-store";
import { getProgress } from "./use-players-store";
import { useRankUpdateModal } from "./use-rank-update-modal";
import { useTypingStats } from "./use-typing-stats";

export const useEndGame = (
  user: User,
  typingStats: TypingStats,
  game: Game,
) => {
  const { finishGame, endedAt, hasFinished } = useGameStore();
  const { acc, wpm, position } = useTypingStats(typingStats, user.id);
  const router = useRouter();
  const { setAlert } = useAlert();
  const { isModalOpen } = useRankUpdateModal();

  const sendResult = useCallback(() => {
    socket.emit("progress", {
      progress: calculateProgress(
        typingStats.charsTyped - +!!typingStats.prevError,
        game.paragraph,
      ),
      gameId: game.id,
    });
    if (getProgress(user.id) >= 50)
      socket.emit("playerFinished", { wpm, acc, position, gameId: game.id });
  }, [
    typingStats.charsTyped,
    typingStats.prevError,
    wpm,
    acc,
    position,
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

  useEffect(() => {
    if (endedAt) {
      const timeout = setTimeout(() => {
        if (isModalOpen) {
          clearTimeout(timeout);
          return;
        }
        if (getProgress(user.id) >= 50)
          router.push(`/games/${game.id}/history`);
        else {
          setAlert(
            "info",
            "Your progress is not saved because it is below 50%",
          );
          router.push("/");
        }
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [endedAt, isModalOpen]);
};
