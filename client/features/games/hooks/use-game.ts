import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { User } from "@/features/users/types";

export const useGame = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [players, setPlayers] = useState<User[]>([]);

  useEffect(() => {
    socket.connect();
    function onConnect() {
      setIsConnected(true);
      socket.emit("joinGame", {}, (val: any) => console.log({ val }));
      console.log("Game joined");
    }

    function onDisconnect() {
      console.log("Game left");
      setIsConnected(false);
    }

    function getPlayers(players: User[]) {
      setPlayers((_) => players);
      console.log("Players fetched!");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("players", getPlayers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { isConnected, players };
};
