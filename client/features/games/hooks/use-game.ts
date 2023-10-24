import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { Game } from "../types";
import { User } from "@/features/users/types";

export const useGame = () => {
  const [players, setPlayers] = useState<User[]>([]);
  const [playersFinishedCount, setPlayersFinishedCount] = useState(0);
  const [game, setGame] = useState<Game | null>(null);
  const [playersProgress, setPlayersProgress] = useState<
    Record<number, number>
  >({});
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    socket.connect();
    function onConnect() {
      socket.emit("joinGame");
    }

    const onPlayers = (updatedPlayers: User[]) => {
      setPlayers(updatedPlayers);
    };

    const onPlayerProgress = ({
      id,
      progress,
    }: User & { progress: number }) => {
      setPlayersProgress((prevProgress) => ({
        ...prevProgress,
        [id]: progress,
      }));
    };

    const onPlayerFinished = () => {
      setPlayersFinishedCount((c) => c + 1);
    };

    socket.on("connect", onConnect);
    socket.on("players", onPlayers);
    socket.on("playerProgress", onPlayerProgress);
    socket.on("playerFinished", onPlayerFinished);
    socket.on("startGame", (game) => setGame(game));

    return () => {
      socket.off("connect");
      socket.off("players");
      socket.off("playerLeft");
      socket.off("playerJoined");
      socket.off("playerProgress");
      socket.off("startGame");
      socket.off("endGame");
      socket.disconnect();
    };
  }, []);

  return {
    players,
    game,
    setIsGameOver,
    isGameOver,
    playersProgress,
    playersFinishedCount,
  };
};
