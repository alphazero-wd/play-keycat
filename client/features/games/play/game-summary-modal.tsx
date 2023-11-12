import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/ui/alert-dialog";
import { Label } from "@/features/ui/label";
import {
  BoltIcon,
  ChartBarIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { displayCPsEarned, displayPosition } from "../history";
import { useGameSummaryModal } from "./hooks";

export const GameSummaryModal = () => {
  const { isModalOpen, wpm, acc, catPoints, position, onClose } =
    useGameSummaryModal();

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
        value: <div className="text-lg">{acc}</div>,
      },
      {
        label: "Position",
        icon: ChartBarIcon,
        value: displayPosition(position),
      },
      {
        label: "Cat Points",
        icon: StarIcon,
        value: displayCPsEarned(catPoints),
      },
    ],
    [wpm, acc, catPoints, position],
  );

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
          {playerStats.map((stat) => (
            <li key={stat.label} className="flex justify-between">
              <div className="flex flex-1 items-center gap-x-4 text-muted-foreground">
                <stat.icon className="h-5 w-5" />
                <Label>{stat.label}</Label>
              </div>

              <div className="text-right">{stat.value}</div>
            </li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
