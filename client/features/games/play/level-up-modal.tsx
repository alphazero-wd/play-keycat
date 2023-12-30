import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/ui/alert-dialog";
import { useUserMenu } from "@/features/ui/navbar/use-user-menu";
import { ProfileXPs } from "@/features/users/profile";
import { useEffect } from "react";
import { GameModeButton } from "../../ui/button";
import { useLevelUpModal } from "./hooks";
import { GameMode } from "./types";

export const LevelUpModal = ({ gameMode }: { gameMode: GameMode }) => {
  const isModalOpen = useLevelUpModal.use.isModalOpen();
  const onClose = useLevelUpModal.use.onClose();
  const newLevel = useLevelUpModal.use.currentLevel();
  const xpsGained = useLevelUpModal.use.xpsGained();
  const levelUp = useUserMenu.use.setLevel();
  const xpsRequired = useLevelUpModal.use.xpsRequired();
  const setXPsRequired = useUserMenu.use.setXPsRequired();

  useEffect(() => {
    if (!isModalOpen) return;
    levelUp(newLevel);
    setXPsRequired(xpsRequired);
  }, [isModalOpen, xpsRequired, newLevel]);

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Level Up</AlertDialogTitle>
          <AlertDialogDescription>
            Congrats, you&apos;ve reached level {newLevel} 🎉
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-5 flex items-center justify-between gap-x-4">
          <div className="w-[80%]">
            <ProfileXPs xpsGained={xpsGained} xpsRequired={xpsRequired} />
          </div>
          <div className="font-medium text-secondary-foreground">
            {xpsGained} / {xpsRequired}
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
