import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { User } from "@/features/users/types";

export const useGame = () => {
  const [players, setPlayers] = useState<User[]>([]);

  useEffect(() => {
    socket.connect();
    function onConnect() {
      socket.emit("joinGame", {}, (val: any) => console.log({ val }));
      console.log("Game joined");
    }

    function getPlayers(players: User[]) {
      setPlayers((_) => players);
      console.log("Players fetched!");
    }

    socket.on("connect", onConnect);
    socket.on("players", getPlayers);

    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, []);

  return { players };
};
