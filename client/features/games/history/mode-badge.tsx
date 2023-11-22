import { Badge } from "@/features/ui/badge";
import { cn } from "@/lib/utils";
import { GameMode } from "../play/types";

export const ModeBadge = ({ mode }: { mode: GameMode }) => {
  return (
    <Badge
      className={cn(
        "text-primary-foreground transition-shadow hover:shadow-md",
        mode === GameMode.CASUAL &&
          "bg-blue-600 hover:shadow-blue-600 dark:bg-blue-300 dark:hover:shadow-blue-300",
        mode === GameMode.PRACTICE &&
          "bg-purple-600 hover:shadow-purple-600 dark:bg-purple-300 dark:hover:shadow-purple-300",
      )}
    >
      {mode[0] + mode.slice(1).toLowerCase()}
    </Badge>
  );
};
