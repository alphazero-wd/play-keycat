"use client";
import { DataTable, DataTablePagination } from "@/features/ui/data-table";
import { User } from "@/features/users/profile";
import { columnsWrapper } from "./columns";
import { useLeaderboard } from "./use-leaderboard";

export const TopPlayersTable = ({ user }: { user?: User }) => {
  const table = useLeaderboard(user);

  return (
    <>
      <DataTable table={table} columns={columnsWrapper(user)} />
      <DataTablePagination table={table} />
    </>
  );
};
