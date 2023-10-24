"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { calculateCPs } from "../utils";
import { useCallback } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
} from "@heroicons/react/20/solid";

export const PlayerStats = ({ game, user }: { game: Game; user?: User }) => {
  const displayCPsEarned = useCallback(
    (wpm: number, acc: number, playersCount: number, pos: number) => {
      const cpsEarned = +calculateCPs(wpm, acc, playersCount, pos);
      if (cpsEarned > 0) {
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-4 py-1 rounded-md dark:bg-green-900 dark:text-green-300">
            <ArrowUpIcon className="w-4 h-4 mr-1.5" />
            {cpsEarned}
          </span>
        );
      } else if (cpsEarned < 0) {
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium inline-flex items-center px-4 py-1 rounded-md dark:bg-red-900 dark:text-red-300">
            <ArrowDownIcon className="w-4 h-4 mr-1.5" />
            {cpsEarned}
          </span>
        );
      } else {
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-4 py-1 rounded-md dark:bg-gray-900 dark:text-gray-300">
            <MinusIcon className="w-4 h-4 mr-1.5" />
            {cpsEarned}
          </span>
        );
      }
    },
    []
  );

  return (
    <Table>
      <TableCaption>
        Note that players whose progress is below 50% won&apos;t be shown here.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px] text-right">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">WPM</TableHead>
          <TableHead className="text-right">Accuracy</TableHead>
          <TableHead className="text-right">Time taken</TableHead>
          <TableHead className="text-right">CPs earned</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {game.histories.map((history, index) => (
          <TableRow key={history.player.id}>
            <TableCell className="font-medium text-right">
              {index + 1}
            </TableCell>
            <TableCell className="flex gap-x-3 items-center">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={`@${history.player.username}`}
                />
                <AvatarFallback>
                  {history.player.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {history.player.username}{" "}
              {history.player.id === user?.id && "(you)"}
            </TableCell>
            <TableCell className="text-right">{history.wpm}</TableCell>
            <TableCell className="text-right">{history.acc}%</TableCell>
            <TableCell className="text-right">
              {format(new Date(history.timeTaken), "mm:ss.SSS")}
            </TableCell>
            <TableCell className="text-right">
              {displayCPsEarned(
                history.wpm,
                history.acc,
                game.histories.length,
                index + 1
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
