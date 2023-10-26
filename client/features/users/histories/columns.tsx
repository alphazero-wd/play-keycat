import { GameHistory } from "@/features/games/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { displayCPsEarned } from "@/features/games/utils";

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
];
