import { PlayerCell } from "@/features/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/features/ui/tooltip";
import { RankBadge, User, getCurrentRank } from "@/features/users/profile";
import { ColumnDef } from "@tanstack/react-table";

export const columnsWrapper = (user?: User) => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "order",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "username",
      header: "Player",
      cell: ({ row }) => <PlayerCell player={row.original} user={user} />,
    },
    {
      accessorKey: "catPoints",
      header: () => <div className="text-right">Cat Points</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.original.catPoints}</div>
      ),
    },
    {
      accessorKey: "rank",
      header: () => <div className="text-center">Rank</div>,
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="mx-auto" asChild>
              <RankBadge catPoints={row.original.catPoints} size="sm" />
            </TooltipTrigger>
            <TooltipContent>
              {getCurrentRank(row.original.catPoints)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "wpm",
      header: () => <div className="text-right">Average WPM</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.original.lastTenAverageWpm}
        </div>
      ),
    },
    {
      accessorKey: "gamesPlayed",
      header: () => <div className="text-right">Games played</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.original.gamesPlayed}</div>
      ),
    },
  ];
  return columns;
};