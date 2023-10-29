"use client";
import { PAGE_LIMIT } from "@/features/constants";
import {
  ColumnDef,
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useEffect, useMemo, useState } from "react";

export const useTable = <TData>(
  columns: ColumnDef<TData>[],
  data: TData[],
  count: number,
) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_LIMIT,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    pageCount: Math.ceil(count / pagination.pageSize),
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
  return table;
};
