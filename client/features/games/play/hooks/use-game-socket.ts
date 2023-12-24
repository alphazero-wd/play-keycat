import { useAlert } from "@/features/ui/alert";
import { socket } from "@/lib/socket";
import { useEffect } from "react";
import { Game } from "../types";
import { useCountdown } from "./use-countdown";
import { useGameStore } from "./use-game-store";
import { useGameSummaryModal } from "./use-game-summary-modal";
import { useLevelUpModal } from "./use-level-up-modal";
import {
  addLeftPlayer,
  getPlayerProgress,
  updatePosition,
  updateProgress,
  usePlayersStore,
} from "./use-players-store";
import { useRankUpdateModal } from "./use-rank-update-modal";

export const useGameSocket = (game: Game) => {
  const setAlert = useAlert.use.setAlert();
  const endedAt = useGameStore.use.endedAt();

  const onPlayers = usePlayersStore.use.onPlayers();

  const startGame = useGameStore.use.startGame();
  const endGame = useGameStore.use.endGame();

  const updateCountdown = useCountdown.use.updateCountdown();

  const onGameSummaryModalOpen = useGameSummaryModal.use.onOpen();

  const onRankUpdateModalOpen = useRankUpdateModal.use.onOpen();
  const onLevelUpModalOpen = useLevelUpModal.use.onOpen();

  useEffect(() => {
    socket.connect();
    function onConnect() {
      if (game.id) socket.emit("joinGame", { gameId: game.id });
    }

    function handlePlayerLeft({
      id,
      username,
    }: {
      id: string;
      username: string;
    }) {
      if (getPlayerProgress(id) < 100 && !endedAt) {
        addLeftPlayer(id);
        setAlert("info", `Player ${username} has left the game!`);
      }
    }

    socket.on("connect", onConnect);
    socket.on("players", onPlayers);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("playerProgress", updateProgress);
    socket.on("startGame", startGame);
    socket.on("levelUp", onLevelUpModalOpen);
    socket.on("countdown", updateCountdown);
    socket.on("endGame", endGame);
    socket.on("updatePosition", updatePosition);
    socket.on("gameSummary", onGameSummaryModalOpen);
    socket.on("rankUpdate", onRankUpdateModalOpen);

    return () => {
      socket.off("connect", onConnect);
      socket.off("players", onPlayers);
      socket.off("playerLeft", handlePlayerLeft);
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
