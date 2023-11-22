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
import { Game } from "../play/types";
import { CPsUpdateStat } from "./cps-update-stat";
import { Position } from "./position";

export const PlayerStats = ({ game, user }: { game: Game; user?: User }) => {
  return (
    <Table>
      <TableCaption>Players who are AFK won&apos;t be shown here.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px] text-right">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">WPM</TableHead>
          <TableHead className="text-right">Accuracy</TableHead>
          <TableHead className="text-center">Position</TableHead>
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
              <PlayerCell
                gameMode={game.mode}
                player={history.player}
                user={user}
              />
            </TableCell>
            <TableCell className="text-right text-base font-medium">
              {history.wpm}
            </TableCell>
            <TableCell className="text-right">{history.acc}%</TableCell>
            <TableCell>
              <div className="mx-auto w-fit text-center">
                <Position
                  position={
                    index > 0 && history.wpm === game.histories[index - 1].wpm
                      ? index
                      : index + 1
                  }
                />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <CPsUpdateStat catPoints={history.catPoints} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
