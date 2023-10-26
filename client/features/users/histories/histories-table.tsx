"use client";
import qs from "query-string";
import React, { useEffect, useMemo, useState } from "react";
import { GameHistory } from "@/features/games/types";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/ui";
import {
  PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { HISTORIES_PAGE_LIMIT } from "@/features/shared/constants";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export const HistoriesTable = ({
  histories,
  playerHistoriesCount,
}: {
  histories: GameHistory[];
  playerHistoriesCount: number;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: HISTORIES_PAGE_LIMIT,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: histories,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    pageCount: Math.ceil(playerHistoriesCount / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    const offset = +(searchParams.get("offset") || "0");
    table.setPageIndex(offset);
  }, []);

  useEffect(() => {
    const queryParams = qs.parse(searchParams.toString());
    queryParams.offset = pageIndex.toString();
    const url = qs.stringifyUrl({ url: pathname, query: queryParams });
    router.replace(url, { scroll: false });
  }, [pageIndex]);

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center w-full justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
