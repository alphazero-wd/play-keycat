"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/ui/alert-dialog";
import { GameModeButton } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { useUserMenu } from "@/features/ui/navbar/use-user-menu";
import {
  BoltIcon,
  BookOpenIcon,
  ChartBarIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo } from "react";
import { CPsUpdateStat, Position } from "../history";
import { useGameSummaryModal } from "./hooks";
import { GameMode } from "./types";

export const GameSummaryModal = ({ gameMode }: { gameMode: GameMode }) => {
  const isModalOpen = useGameSummaryModal.use.isModalOpen();
  const wpm = useGameSummaryModal.use.wpm();
  const acc = useGameSummaryModal.use.acc();
  const catPoints = useGameSummaryModal.use.catPoints();
  const position = useGameSummaryModal.use.position();
  const xpsGained = useGameSummaryModal.use.xpsGained();
  const onClose = useGameSummaryModal.use.onClose();

  const setCatPoints = useUserMenu.use.setCatPoints();
  const updateXPs = useUserMenu.use.updateXPs();
  const currentCPs = useUserMenu.use.catPoints();

  const playerStats = useMemo(
    () => [
      {
        label: "WPM",
        icon: BoltIcon,
        value: <div className="text-xl font-semibold">{wpm}</div>,
      },
      {
        label: "Accuracy",
        icon: SparklesIcon,
        value: <div className="text-lg">{acc}%</div>,
      },
      {
        label: "Position",
        icon: ChartBarIcon,
        value: <Position position={position} />,
      },
      {
        label: "XPs Gained",
        icon: BookOpenIcon,
        value: (
          <div className="text-blue-700 dark:text-blue-300">{xpsGained}</div>
        ),
      },
      {
        label: "Cat Points",
        icon: StarIcon,
        value: <CPsUpdateStat catPoints={catPoints} />,
      },
    ],
    [wpm, acc, catPoints, position],
  );
  useEffect(() => {
    if (isModalOpen) {
      setCatPoints(currentCPs + catPoints);
      updateXPs(xpsGained);
    }
  }, [catPoints, isModalOpen]);

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Game Summary</AlertDialogTitle>
          <AlertDialogDescription>
            Here is a brief analysis of your performance in the game
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="space-y-4">
          {playerStats.map(
            (stat) =>
              // don't show the position in practice mode
              (gameMode !== GameMode.PRACTICE || stat.label !== "Position") && (
                <li key={stat.label} className="flex justify-between">
                  <div className="flex flex-1 items-center gap-x-4 text-muted-foreground">
                    <stat.icon className="h-5 w-5" />
                    <Label>{stat.label}</Label>
                  </div>

                  <div className="text-right">{stat.value}</div>
                </li>
              ),
          )}
        </ul>
        <AlertDialogFooter>
          <GameModeButton onClick={onClose} gameMode={gameMode}>
            Confirm
          </GameModeButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
