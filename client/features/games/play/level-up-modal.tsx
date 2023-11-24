import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/ui/alert-dialog";
import { useUserMenu } from "@/features/ui/navbar/use-user-menu";
import { Progress } from "@/features/ui/progress";
import { User } from "@/features/users/profile";
import { useEffect, useState } from "react";
import { GameModeButton } from "../../ui/button";
import { useLevelUpModal } from "./hooks";
import { GameMode } from "./types";

export const LevelUpModal = ({
  user,
  gameMode,
}: {
  user: User;
  gameMode: GameMode;
}) => {
  const isModalOpen = useLevelUpModal.use.isModalOpen();
  const onClose = useLevelUpModal.use.onClose();
  const currentLevel = useLevelUpModal.use.currentLevel();
  const xpsGained = useLevelUpModal.use.xpsGained();
  const levelUp = useUserMenu.use.levelUp();
  const [xpsGainedChange, setXPsGainedChange] = useState(0);

  useEffect(() => {
    if (!isModalOpen) return;
    const xpsRemainingTimer = setTimeout(
      () => setXPsGainedChange(xpsGained),
      500,
    );
    levelUp(currentLevel);
    return () => {
      clearTimeout(xpsRemainingTimer);
    };
  }, [isModalOpen, xpsGained]);

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Level Up</AlertDialogTitle>
          <AlertDialogDescription>
            Congrats, you&apos;ve reached level {currentLevel} 🎉
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-5 flex items-center justify-between gap-x-4">
          <Progress
            className="w-[80%]"
            value={(xpsGainedChange / user.xpsRequired) * 100}
          />
          <div className="font-medium text-secondary-foreground">
            {xpsGained} / {user.xpsRequired}
          </div>
        </div>
        <AlertDialogFooter>
          <GameModeButton onClick={onClose} gameMode={gameMode}>
            Confirm
          </GameModeButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
