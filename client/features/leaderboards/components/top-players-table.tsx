"use client";
import { useTable } from "@/features/shared/data-table/hooks";
import { User } from "@/features/users/types";
import { columnsWrapper } from "./columns";
import {
  DataTable,
  DataTablePagination,
} from "@/features/shared/data-table/components";
import { useEffect, useMemo, useState } from "react";
import { socket } from "@/lib/socket";

export const TopPlayersTable = ({ user }: { user?: User }) => {
  const [topPlayers, setTopPlayers] = useState<User[]>([]);
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
      }
    );
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <DataTable table={table} columns={columnsWrapper(user)} />
      <DataTablePagination table={table} />
    </>
  );
};
