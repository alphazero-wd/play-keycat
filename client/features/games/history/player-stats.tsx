"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/ui";
import { Game } from "../types";
import { User } from "@/features/users/types";
import { format } from "date-fns";
import { displayCPsEarned } from "../utils";
import { PlayerCell } from "@/features/shared/data-table/components";

export const PlayerStats = ({ game, user }: { game: Game; user?: User }) => {
  return (
    <Table>
      <TableCaption>
        Note that players whose progress is below 50% won&apos;t be shown here.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px] text-right">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">Time</TableHead>
          <TableHead className="text-right">WPM</TableHead>
          <TableHead className="text-right">Accuracy</TableHead>
          <TableHead className="text-right">Cat Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {game.histories.map((history, index) => (
          <TableRow key={history.player.id}>
            <TableCell className="font-medium text-right">
              {index + 1}
            </TableCell>
            <TableCell className="flex gap-x-3 items-center">
              <PlayerCell player={history.player} user={user} />
            </TableCell>
            <TableCell className="text-right">
              {format(new Date(history.timeTaken), "mm:ss.SSS")}
            </TableCell>
            <TableCell className="text-right">{history.wpm}</TableCell>
            <TableCell className="text-right">{history.acc}%</TableCell>
            <TableCell className="text-right">
              {displayCPsEarned(history.catPoints)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
