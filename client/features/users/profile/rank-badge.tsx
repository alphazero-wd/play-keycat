import { cn } from "@/lib/utils";
import Image from "next/image";
import { getCurrentRank } from "./get-current-rank";

interface RankBadgeProps {
  size?: "sm" | "md";
  catPoints: number;
}

const badgeClassesOnSize = {
  md: "h-[200px] w-[200px]",
  sm: "h-[40px] w-[40px]",
};

export const RankBadge = ({ catPoints, size = "md" }: RankBadgeProps) => {
  if (catPoints < 500) {
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
      src={`/images/${getCurrentRank(catPoints)
        .split(" ")[0]
        .toLowerCase()}.png`}
      width={size === "md" ? 200 : 40}
      className="mx-auto"
      height={size === "md" ? 200 : 40}
      alt={getCurrentRank(catPoints)}
    />
  );
};
