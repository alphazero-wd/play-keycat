import { useTable } from "@/features/ui/data-table";
import { Profile, User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { useEffect, useMemo, useState } from "react";
import { columnsWrapper } from "./columns";

export const useLeaderboard = (user?: User) => {
  const [topPlayers, setTopPlayers] = useState<Profile[]>([]);
  const [topPlayersCount, setTopPlayersCount] = useState(0);
  const table = useTable(columnsWrapper(user), topPlayers, topPlayersCount);

  const offset = useMemo(() => {
    const { pagination } = table.getState();
    return pagination.pageIndex * pagination.pageSize;
  }, [table.getState().pagination]);

  useEffect(() => {
    socket.emit("getLeaderboard", { offset });
  }, [offset]);

  useEffect(() => {
    socket.connect();
    socket.on("leaderboardUpdate", () => {
      socket.emit("getLeaderboard", { offset });
    });
    socket.on(
      "leaderboardUpdated",
      ({ topPlayers: players, topPlayersCount: count }) => {
        setTopPlayers(players);
        setTopPlayersCount(count);
      },
    );
    return () => {
      socket.disconnect();
    };
  }, []);

  return table;
};
