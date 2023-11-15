import { useAlert } from "@/features/ui/alert";
import { socket } from "@/lib/socket";
import { useEffect } from "react";
import { Game } from "../types";
import { useCountdown } from "./use-countdown";
import { useGameStore } from "./use-game-store";
import { useGameSummaryModal } from "./use-game-summary-modal";
import {
  addLeftPlayer,
  getPlayerProgress,
  updatePosition,
  updateProgress,
  usePlayersStore,
} from "./use-players-store";
import { useRankUpdateModal } from "./use-rank-update-modal";

export const useGameSocket = (game: Game, userId?: number) => {
  const { onPlayers, resetPlayers } = usePlayersStore();
  const { startGame, resetGame, endGame, endedAt } = useGameStore();
  const { updateCountdown, resetCountdown } = useCountdown();
  const { onOpen: onRankUpdateModalOpen, onClose: onRankUpdateModalClose } =
    useRankUpdateModal();
  const { onOpen: onGameSummaryModalOpen, onClose: onGameSummaryModalClose } =
    useGameSummaryModal();
  const { setAlert } = useAlert();

  useEffect(() => {
    socket.connect();
    function onConnect() {
      if (game.id) socket.emit("joinGame", { gameId: game.id });
    }

    function handlePlayerLeft({
      id,
      username,
    }: {
      id: number;
      username: string;
    }) {
      if (getPlayerProgress(id) < 100 && !endedAt) {
        addLeftPlayer(id);
        if (userId !== id) setAlert("info", `${username} has left the game!`);
      }
    }

    socket.on("connect", onConnect);
    socket.on("players", onPlayers);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("resetCountdown", resetCountdown);
    socket.on("playerProgress", updateProgress);
    socket.on("startGame", startGame);
    socket.on("countdown", updateCountdown);
    socket.on("endGame", endGame);
    socket.on("updatePosition", updatePosition);
    socket.on("gameSummary", onGameSummaryModalOpen);
    socket.on("rankUpdate", onRankUpdateModalOpen);

    return () => {
      resetPlayers();
      resetGame();
      resetCountdown();
      onRankUpdateModalClose();
      onGameSummaryModalClose();
      socket.off("connect", onConnect);
      socket.off("players", onPlayers);
      socket.off("playerLeft", handlePlayerLeft);
      socket.off("resetCountdown", resetCountdown);
      socket.off("playerProgress", updateProgress);
      socket.off("startGame", startGame);
      socket.off("countdown", updateCountdown);
      socket.off("endGame", endGame);
      socket.off("gameSummary", onGameSummaryModalOpen);
      socket.off("rankUpdate", onRankUpdateModalOpen);
      socket.disconnect();
    };
  }, [game.id]);
};
