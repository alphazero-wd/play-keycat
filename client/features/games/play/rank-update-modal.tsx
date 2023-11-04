import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/ui/alert-dialog";
import { RankBadge } from "@/features/users/profile";
import { useRankUpdateModal } from "./hooks";
import { RankUpdateStatus } from "./types";

export const RankUpdateModal = () => {
  const { isModalOpen, status, fromRank, toRank, onClose, catPoints } =
    useRankUpdateModal();

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
            You&apos;ve been {status?.toLowerCase()} from rank{" "}
            <span className="text-lg font-semibold">{fromRank}</span> to rank{" "}
            <span className="text-lg font-semibold">{toRank}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-5">
          <RankBadge catPoints={catPoints} />
        </div>
        <AlertDialogFooter>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
