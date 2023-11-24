"use client";
import { Progress } from "@/features/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/features/ui/tooltip";
interface ProfileXPsProps {
  xpsGained: number;
  xpsRequired: number;
}
export const ProfileXPs = ({ xpsGained, xpsRequired }: ProfileXPsProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipContent>
          {xpsGained} / {xpsRequired}
        </TooltipContent>
        <TooltipTrigger asChild>
          <Progress
            className="h-2 w-full"
            value={(xpsGained / xpsRequired) * 100}
          />
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};
