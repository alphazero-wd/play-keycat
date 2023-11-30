import { cn } from "@/lib/utils";
import Image from "next/image";

interface RankBadgeProps {
  size?: "sm" | "md";
  rank: string;
}

const badgeClassesOnSize = {
  md: "h-[200px] w-[200px]",
  sm: "h-[40px] w-[40px]",
};

export const RankBadge = ({
  rank = "Unranked",
  size = "md",
}: RankBadgeProps) => {
  if (rank === "Unranked") {
    return (
      <div
        className={cn(
          "mx-auto rounded-full border-2 border-dashed border-muted-foreground",
          badgeClassesOnSize[size],
        )}
      />
    );
  }
  return (
    <Image
      src={`/images/${rank.split(" ")[0].toLowerCase()}.png`}
      width={500}
      className={cn(
        "mx-auto",
        size === "sm" ? "relative -left-1 h-12 w-12" : "h-52 w-52",
      )}
      height={500}
      alt={rank}
    />
  );
};
