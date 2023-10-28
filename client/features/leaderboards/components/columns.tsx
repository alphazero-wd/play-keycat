import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/features/users/types";
import { PlayerCell } from "@/features/shared/data-table/components";
import Image from "next/image";
import { getCurrentRank } from "@/features/users/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/features/ui";

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
              {row.original.catPoints < 500 ? (
                <div className="border-dashed rounded-full w-[40px] h-[40px] border-muted-foreground border-2" />
              ) : (
                <Image
                  width={40}
                  height={40}
                  src={`/images/${getCurrentRank(row.original.catPoints)
                    .split(" ")[0]
                    .toLowerCase()}.png`}
                  alt={getCurrentRank(row.original.catPoints)}
                />
              )}
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
