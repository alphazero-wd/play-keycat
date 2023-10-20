import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { User } from "@/features/users/types";
import { Game } from "../types";

export const useGame = () => {
  const [players, setPlayers] = useState<User[]>([]);
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    socket.connect();
    function onConnect() {
      socket.emit("joinGame");
    }

    function getPlayers(players: User[]) {
      setPlayers((_) => players);
    }

    socket.on("connect", onConnect);
    socket.on("players", getPlayers);
    socket.on("startGame", (game) => setGame(game));

    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, []);

  return { players, game };
};
