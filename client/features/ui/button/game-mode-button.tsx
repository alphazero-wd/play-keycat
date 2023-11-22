import { GameMode } from "@/features/games/play/types";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface GameModeButtonProps
  extends ButtonProps,
    React.RefAttributes<HTMLButtonElement> {
  gameMode: GameMode;
}

export const GameModeButton = ({ gameMode, ...props }: GameModeButtonProps) => {
  return (
    <Button
      className={cn(
        "hover:shadow-lg",
        gameMode === GameMode.CASUAL &&
          "bg-blue-600 hover:shadow-blue-600 dark:bg-blue-300 dark:hover:shadow-blue-300",
        gameMode === GameMode.PRACTICE &&
          "bg-purple-600 hover:shadow-purple-600 dark:bg-purple-300 dark:hover:shadow-purple-300",
      )}
      {...props}
    />
  );
};
