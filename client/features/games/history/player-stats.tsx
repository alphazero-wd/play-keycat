"use client";
import {
  PlayerCell,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/ui/table";
import { User } from "@/features/users/profile";
import { format } from "date-fns";
import { Game } from "../play";
import { displayCPsEarned } from "./display-cps-earned";

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
            <TableCell className="text-right font-medium">
              {index + 1}
            </TableCell>
            <TableCell className="flex items-center gap-x-3">
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
