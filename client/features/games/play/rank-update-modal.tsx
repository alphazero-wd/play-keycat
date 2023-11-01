import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/ui/alert-dialog";
import { RankBadge, User, getCurrentRank } from "@/features/users/profile";
import { memo, useMemo } from "react";

enum RankUpdateStatus {
  PROMOTED = "PROMOTED",
  DEMOTED = "DEMOTED",
}

export const RankUpdateModal = memo(
  ({
    user,
    catPoints,
    isOpen,
    onClose,
  }: {
    catPoints: number;
    user: User;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const rankUpdateStatus = useMemo(() => {
      const currentCPs = user.catPoints;
      const updatedCPs = user.catPoints + catPoints;
      if (getCurrentRank(currentCPs) === getCurrentRank(updatedCPs)) return "";
      if (catPoints < 0) return RankUpdateStatus.DEMOTED;
      return RankUpdateStatus.PROMOTED;
    }, [user.catPoints, catPoints]);

    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {rankUpdateStatus === RankUpdateStatus.PROMOTED
                ? "Rank Promotion"
                : "Rank Demotion"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve been {rankUpdateStatus.toLowerCase()} to rank{" "}
              {getCurrentRank(user.catPoints + catPoints)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-5">
            <RankBadge catPoints={user.catPoints + catPoints} />
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
