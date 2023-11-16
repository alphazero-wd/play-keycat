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
              "text-lime-500 dark:text-lime-300",
            typingStats.prevError === index && "bg-red-600 text-white",
            typingStats.charsTyped === index && "bg-primary text-white",
          )}
        >
          {char}
        </span>
      ))}
    </p>
  );
};
