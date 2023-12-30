import { format } from "date-fns";
import { useMemo } from "react";
import { useCountdown, useGameStore } from "./hooks";
import { GameMode } from "./types";

export const GameSubheading = ({ gameMode }: { gameMode: GameMode }) => {
  const startedAt = useGameStore.use.startedAt();
  const endedAt = useGameStore.use.endedAt();
  const countdown = useCountdown.use.countdown();

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
