import { cn } from "@/lib/utils";
import { Game, TypingStats } from "./types";

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
            "mb-2 mr-0.5 font-mono text-foreground",
            index < (typingStats.prevError || typingStats.charsTyped) &&
              "text-green-500 dark:text-green-300",
            typingStats.prevError === index &&
              "bg-red-600 text-primary-foreground dark:bg-red-300",
            typingStats.charsTyped === index &&
              "bg-primary text-primary-foreground",
          )}
        >
          {char}
        </span>
      ))}
    </p>
  );
};
