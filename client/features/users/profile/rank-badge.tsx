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

export const RankBadge = ({ rank, size = "md" }: RankBadgeProps) => {
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
      width={size === "md" ? 200 : 40}
      className="mx-auto"
      height={size === "md" ? 200 : 40}
      alt={rank}
    />
  );
};
