"use client";
import { GameHistory } from "@/features/games/history";
import {
  DataTable,
  DataTablePagination,
  useTable,
} from "@/features/ui/data-table";
import { columns } from "./columns";

export const HistoriesTable = ({
  histories,
  playerHistoriesCount,
}: {
  histories: GameHistory[];
  playerHistoriesCount: number;
}) => {
  const table = useTable(columns, histories, playerHistoriesCount);
  return (
    <>
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
    </>
  );
};
