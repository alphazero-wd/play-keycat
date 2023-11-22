import { cn } from "@/lib/utils";
import { Roboto_Mono } from "next/font/google";
import { Game, TypingStats } from "./types";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

const colorBasedOnGameMode = {
  RANKED: "border-primary text-primary",
  CASUAL:
    "border-blue-600 dark:border-blue-300 text-blue-600 dark:text-blue-300",
  PRACTICE:
    "border-purple-600 dark:border-purple-300 text-purple-600 dark:text-purple-300",
} as const;

export const TypingParagraph = ({
  game,
  typingStats,
}: {
  game: Game;
  typingStats: TypingStats;
}) => {
  return (
    <p className="my-4 text-xl leading-8 tracking-wide text-secondary-foreground">
      {game.paragraph.split("").map((char, index) => (
        <span
          key={index}
          className={cn(
            robotoMono.className,
            "mb-2 text-foreground",
            index < (typingStats.prevError || typingStats.charsTyped) &&
              "bg-green-100 text-green-700 dark:bg-green-200",
            typingStats.prevError === index &&
              "bg-red-100 text-red-700 dark:bg-red-200",
            typingStats.charsTyped === index &&
              cn("border-b-4", colorBasedOnGameMode[game.mode]),
          )}
        >
          {char}
        </span>
      ))}
    </p>
  );
};
