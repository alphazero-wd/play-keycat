import { socket } from "@/lib/socket";
import { useEffect } from "react";
import { useGameStore } from "./use-game-store";
import { updateProgress, usePlayersStore } from "./use-players-store";

export const useGameSocket = (gameId: number) => {
  const { onPlayers, clearProgress } = usePlayersStore();
  const { startGame, resetGame } = useGameStore();

  useEffect(() => {
    clearProgress();
    resetGame();
    socket.connect();
    function onConnect() {
      if (gameId) socket.emit("joinGame", { gameId });
    }

    socket.on("connect", onConnect);
    socket.on("players", onPlayers);
    socket.on("playerProgress", updateProgress);
    socket.on("startGame", startGame);

    return () => {
      socket.disconnect();
    };
  }, []);
};
