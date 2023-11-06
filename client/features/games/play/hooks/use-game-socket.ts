import { socket } from "@/lib/socket";
import { useEffect } from "react";
import { useCountdown } from "./use-countdown";
import { useGameStore } from "./use-game-store";
import { updateProgress, usePlayersStore } from "./use-players-store";
import { useRankUpdateModal } from "./use-rank-update-modal";

export const useGameSocket = (gameId: number) => {
  const { onPlayers, clearProgress } = usePlayersStore();
  const { startGame, resetGame, endGame } = useGameStore();
  const { updateCountdown, resetCountdown } = useCountdown();
  const { onOpen } = useRankUpdateModal();

  useEffect(() => {
    clearProgress();
    resetGame();
    resetCountdown();
    socket.connect();
    function onConnect() {
      if (gameId) socket.emit("joinGame", { gameId });
    }

    socket.on("connect", onConnect);
    socket.on("players", onPlayers);
    socket.on("playerProgress", updateProgress);
    socket.on("startGame", startGame);
    socket.on("countdown", updateCountdown);
    socket.on("endGame", endGame);
    socket.on("rankUpdate", onOpen);

    return () => {
      socket.disconnect();
    };
  }, []);
};
