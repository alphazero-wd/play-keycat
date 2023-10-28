"use client";
import { GameHistory } from "@/features/games/types";
import {
  DataTable,
  DataTablePagination,
} from "@/features/shared/data-table/components";
import { useTable } from "@/features/shared/data-table/hooks";
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
