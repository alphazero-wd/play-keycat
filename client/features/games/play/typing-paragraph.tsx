import { cn } from "@/lib/utils";
import { Roboto_Mono } from "next/font/google";
import { GameMode, TypingStats } from "./types";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

const colorBasedOnGameMode = {
  RANKED: "border-primary text-primary",
  CASUAL:
    "border-blue-600 dark:border-blue-300 text-blue-600 dark:text-blue-300",
  PRACTICE:
    "border-purple-600 dark:border-purple-300 text-purple-600 dark:text-purple-300",
} as const;

export const TypingParagraph = ({
  paragraph,
  gameMode,
  prevError,
  charsTyped,
}: {
  paragraph: string;
  gameMode: GameMode;
  prevError: TypingStats["prevError"];
  charsTyped: TypingStats["charsTyped"];
}) => {
  return (
    <p className="my-4 text-xl leading-8 tracking-wide text-secondary-foreground">
      {paragraph.split("").map((char, index) => (
        <span
          key={index}
          data-testid={index}
          className={cn(
            robotoMono.className,
            "mb-2 text-foreground",
            index < (prevError || charsTyped) &&
              "bg-green-100 text-green-700 dark:bg-green-200",
            prevError === index && "bg-red-100 text-red-700 dark:bg-red-200",
            charsTyped === index &&
              cn("border-b-4", colorBasedOnGameMode[gameMode]),
          )}
        >
          {char}
        </span>
      ))}
    </p>
  );
};
