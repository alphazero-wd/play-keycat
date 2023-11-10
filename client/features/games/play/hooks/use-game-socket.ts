import { useAlert } from "@/features/ui/alert";
import { socket } from "@/lib/socket";
import { useEffect } from "react";
import { useCountdown } from "./use-countdown";
import { useGameStore } from "./use-game-store";
import {
  getProgress,
  onPlayerLeft,
  updateProgress,
  usePlayersStore,
} from "./use-players-store";
import { useRankUpdateModal } from "./use-rank-update-modal";

export const useGameSocket = (gameId: number, userId?: number) => {
  const { onPlayers, clearProgress } = usePlayersStore();
  const { startGame, resetGame, endGame } = useGameStore();
  const { updateCountdown, resetCountdown } = useCountdown();
  const { onOpen, onClose } = useRankUpdateModal();
  const { setAlert } = useAlert();

  useEffect(() => {
    clearProgress();
    resetGame();
    resetCountdown();
    onClose();
    socket.connect();
    function onConnect() {
      if (gameId) socket.emit("joinGame", { gameId });
    }

    socket.on("connect", onConnect);
    socket.on("players", onPlayers);
    socket.on("playerLeft", ({ id, username }) => {
      if (getProgress(id) < 100) {
        onPlayerLeft(id);
        if (userId !== id) setAlert("info", `${username} has left the game!`);
      }
    });
    socket.on("resetCountdown", resetCountdown);
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
