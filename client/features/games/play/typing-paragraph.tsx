import { Game, TypingStats } from "./types";

export const TypingParagraph = ({
  game,
  typingStats,
}: {
  game: Game;
  typingStats: TypingStats;
}) => {
  return (
    <p className="my-4 text-lg text-secondary-foreground">
      {game.paragraph
        .substring(0, typingStats.charsTyped)
        .split("")
        .map((char, index) => (
          <span
            className={
              typingStats.prevError === index ? "bg-red-200" : "bg-green-200"
            }
          >
            {char}
          </span>
        ))}
      {game.paragraph.substring(typingStats.charsTyped)}
    </p>
  );
};
