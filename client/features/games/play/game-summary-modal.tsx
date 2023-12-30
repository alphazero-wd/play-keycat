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
  ChartBarIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Badge as BadgeIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { CPsUpdateStat, Position } from "../shared";
import { useGameSummaryModal } from "./hooks";
import { GameMode } from "./types";

export const GameSummaryModal = ({ gameMode }: { gameMode: GameMode }) => {
  const isModalOpen = useGameSummaryModal.use.isModalOpen();
  const wpm = useGameSummaryModal.use.wpm();
  const acc = useGameSummaryModal.use.acc();
  const catPoints = useGameSummaryModal.use.catPoints();
  const position = useGameSummaryModal.use.position();
  const totalXPsBonus = useGameSummaryModal.use.totalXPsBonus();
  const newXPsGained = useGameSummaryModal.use.newXPsGained();
  const onClose = useGameSummaryModal.use.onClose();

  const setCatPoints = useUserMenu.use.setCatPoints();
  const setXPs = useUserMenu.use.setXPs();
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
        label: "Experience",
        icon: BadgeIcon,
        value: (
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
            +{totalXPsBonus} XP
          </div>
        ),
      },
      {
        label: "Cat Points",
        icon: StarIcon,
        value: <CPsUpdateStat catPoints={catPoints} />,
      },
    ],
    [wpm, acc, catPoints, position, totalXPsBonus],
  );
  useEffect(() => {
    if (isModalOpen) {
      setCatPoints(currentCPs + catPoints);
      setXPs(newXPsGained);
    }
  }, [catPoints, isModalOpen, newXPsGained]);

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
