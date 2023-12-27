import { format } from "date-fns";
import { useMemo } from "react";
import { GameMode } from "./types";

interface GameSubheadingProps {
  gameMode: GameMode;
  startedAt: string | null;
  endedAt: string | null;
  countdown: number;
}

export const GameSubheading = ({
  gameMode,
  startedAt,
  endedAt,
  countdown,
}: GameSubheadingProps) => {
  const subtitle = useMemo(() => {
    if (!startedAt && !isFinite(countdown)) {
      if (gameMode === GameMode.PRACTICE)
        return "Wait while we prepare a solo practice environment for you...";
      return "Waiting for opponents with similar levels...";
    }
    if (!startedAt && countdown >= 0)
      return `Game starting in ${countdown} seconds...`;
    if (startedAt && !endedAt && countdown > 0)
      return `Time remaining ${format(countdown * 1000, "mm:ss")}`;
    return "Game has ended. Have a look at the history or, maybe another game?";
  }, [startedAt, countdown, endedAt]);

  return (
    <p className="font-normal text-muted-foreground md:text-lg">{subtitle}</p>
  );
};
