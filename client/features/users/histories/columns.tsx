"use client";
import { GameHistory, displayCPsEarned } from "@/features/games/history";
import { EyeIcon } from "@heroicons/react/24/outline";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "../../ui/button";

export const columns: ColumnDef<GameHistory>[] = [
  {
    accessorKey: "gameId",
    header: "#",
  },
  {
    accessorKey: "startedAt",
    header: "Played at",
    cell: ({ row }) => (
      <div>
        {format(new Date(row.original.game.startedAt), "dd/MM/Y hh:mm a")}
      </div>
    ),
  },
  {
    accessorKey: "wpm",
    header: () => <div className="text-right">WPM</div>,
    cell: ({ row }) => <div className="text-right">{row.original.wpm}</div>,
  },
  {
    accessorKey: "acc",
    header: () => <div className="text-right">Accuracy</div>,
    cell: ({ row }) => <div className="text-right">{row.original.acc}%</div>,
  },
  {
    accessorKey: "catPoints",
    header: () => <div className="text-right">CPs earned</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {displayCPsEarned(row.original.catPoints)}
      </div>
    ),
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="icon">
        <Link href={`/games/${row.original.gameId}/history`}>
          <EyeIcon className="h-5 w-5" />
        </Link>
      </Button>
    ),
  },
];
