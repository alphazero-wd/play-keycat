import { useAlert } from "@/features/ui/alert";
import { User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Game, TypingStats } from "../types";
import { calculateProgress } from "../utils";
import { useGameStore } from "./use-game-store";
import { getProgress } from "./use-players-store";
import { useTypingStats } from "./use-typing-stats";

export const useEndGame = (
  user: User,
  typingStats: TypingStats,
  game: Game,
  timeRemaining: number,
) => {
  const { endGame, hasFinished } = useGameStore();
  const { acc, wpm, catPoints } = useTypingStats(typingStats, user.id);
  const router = useRouter();
  const { setAlert } = useAlert();

  const sendResult = useCallback(() => {
    socket.emit("progress", {
      progress: calculateProgress(
        typingStats.charsTyped - +!!typingStats.prevError,
        game.paragraph,
      ),
      gameId: game.id,
    });
    if (getProgress(user.id) >= 50) {
      socket.emit("playerFinished", { wpm, acc, catPoints, gameId: game.id });
    }
  }, [
    typingStats.charsTyped,
    typingStats.prevError,
    wpm,
    acc,
    catPoints,
    game.paragraph,
    game.id,
  ]);

  // const showRankUpdateModal = useCallback(() => {
  //   const nextRank = getCurrentRank(user.catPoints + catPoints);
  //   const currentRank = getCurrentRank(user.catPoints);
  //   if (hasFinished && nextRank !== currentRank)
  //     onOpen(
  //       currentRank,
  //       nextRank,
  //       catPoints > 0 ? RankUpdateStatus.PROMOTED : RankUpdateStatus.DEMOTED,
  //       user.catPoints + catPoints,
  //     );
  // }, [hasFinished, timeRemaining, user.catPoints]);

  useEffect(() => {
    const isLastCharacterMatch =
      game.paragraph[typingStats.charsTyped - 1] === game.paragraph.at(-1);
    const hasReachedTheEnd = typingStats.charsTyped === game.paragraph.length;

    if (hasReachedTheEnd && isLastCharacterMatch) {
      endGame();
      sendResult();
    }
  }, [typingStats.charsTyped, game.paragraph, sendResult]);

  useEffect(() => {
    const hasTimeup = !hasFinished && timeRemaining === 0; // avoid overridding finished result
    if (hasTimeup) {
      sendResult();
    }
  }, [timeRemaining, hasFinished, sendResult]);

  useEffect(() => {
    if (timeRemaining !== 0) return;
    const timeout = setTimeout(() => {
      if (getProgress(user.id) >= 50) router.push(`/games/${game.id}/history`);
      else {
        setAlert("info", "Your progress is not saved because it is below 50%");
        router.push("/");
      }
      router.refresh();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [hasFinished, timeRemaining]);
};
