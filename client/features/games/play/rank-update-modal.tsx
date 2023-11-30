import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/ui/alert-dialog";
import { useUserMenu } from "@/features/ui/navbar/use-user-menu";
import { RankBadge } from "@/features/users/profile";
import { useEffect } from "react";
import { useRankUpdateModal } from "./hooks";
import { RankUpdateStatus } from "./types";

export const RankUpdateModal = () => {
  const isModalOpen = useRankUpdateModal.use.isModalOpen();
  const status = useRankUpdateModal.use.status();
  const onClose = useRankUpdateModal.use.onClose();
  const currentRank = useRankUpdateModal.use.currentRank();
  const setRank = useUserMenu.use.setRank();

  useEffect(() => {
    if (isModalOpen && currentRank) setRank(currentRank);
  }, [isModalOpen, currentRank]);
  if (!currentRank) return;

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {status === RankUpdateStatus.PROMOTED
              ? "Rank Promotion"
              : "Rank Demotion"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ve been {status?.toLowerCase()} to rank{" "}
            <span className="text-lg font-semibold">{currentRank}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-5">
          <RankBadge rank={currentRank} />
        </div>
        <AlertDialogFooter>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
