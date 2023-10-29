import { User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";

export const useGame = (gameId: number) => {
  const [players, setPlayers] = useState<User[]>([]);
  const [playersProgress, setPlayersProgress] = useState<
    Record<number, number>
  >({});
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    socket.connect();
    function onConnect() {
      socket.emit("joinGame", { gameId });
    }

    const onPlayers = (updatedPlayers: User[]) => {
      setPlayers(updatedPlayers);
    };

    const onPlayerProgress = ({
      id,
      progress,
    }: {
      id: number;
      progress: number;
    }) => {
      setPlayersProgress((prevProgress) => ({
        ...prevProgress,
        [id]: progress,
      }));
    };

    socket.on("connect", onConnect);
    socket.on("players", onPlayers);
    socket.on("playerProgress", onPlayerProgress);
    socket.on("startGame", () => setStartedAt(new Date()));

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
    startedAt,
    setIsGameOver,
    isGameOver,
    playersProgress,
  };
};
