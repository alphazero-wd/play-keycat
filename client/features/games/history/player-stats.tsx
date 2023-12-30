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
import { GameMode } from "../play/types";
import { CPsUpdateStat, Position } from "../shared";
import { GameHistory } from "./types";

interface PlayerStatsProps {
  gameMode: GameMode;
  histories: Omit<GameHistory, "game">[];
  userId?: string;
}

export const PlayerStats = ({
  gameMode,
  histories,
  userId,
}: PlayerStatsProps) => {
  const playerPositions = (() => {
    const positions = Array(histories.length).fill(0);
    let currentPosition = 1;
    histories.forEach((history, i) => {
      positions[i] = currentPosition;
      if (i == histories.length - 1 || histories[i + 1].wpm < history.wpm)
        currentPosition++;
    });
    return positions;
  })();

  return (
    <Table>
      <TableCaption>Players who are AFK won&apos;t be shown here.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px] text-right">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">WPM</TableHead>
          <TableHead className="text-right">Accuracy</TableHead>
          {gameMode !== GameMode.PRACTICE && (
            <TableHead className="text-center">Position</TableHead>
          )}
          <TableHead className="text-right">Cat Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {histories.map((history, index) => (
          <TableRow key={history.player.id}>
            <TableCell className="text-right font-medium">
              {index + 1}
            </TableCell>
            <TableCell className="flex items-center gap-x-3">
              <PlayerCell
                gameMode={gameMode}
                username={history.player.username}
                userId={userId}
              />
            </TableCell>
            <TableCell className="text-right text-base font-medium">
              {history.wpm}
            </TableCell>
            <TableCell className="text-right">{history.acc}%</TableCell>
            {gameMode !== GameMode.PRACTICE && (
              <TableCell>
                <div className="mx-auto w-fit text-center">
                  <Position position={playerPositions[index]} />
                </div>
              </TableCell>
            )}
            <TableCell className="text-right">
              <CPsUpdateStat catPoints={history.catPoints} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
