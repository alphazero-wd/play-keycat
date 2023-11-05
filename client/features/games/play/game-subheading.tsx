import { format } from "date-fns";
import { useMemo } from "react";
import { useCountdown, useGameStore } from "./hooks";

export const GameSubheading = () => {
  const { startedAt, endedAt } = useGameStore();
  const { countdown } = useCountdown();

  const subtitle = useMemo(() => {
    if (!startedAt && !isFinite(countdown))
      return "Waiting for opponents with similar levels...";
    if (!startedAt && countdown >= 0)
      return `Game starting in ${countdown} seconds...`;
    if (startedAt && !endedAt)
      return `Time remaining ${format(countdown * 1000, "mm:ss")}`;
    return "Game has ended. Showing game history...";
  }, [startedAt, countdown]);

  return (
    <p className="font-normal text-muted-foreground md:text-lg">{subtitle}</p>
  );
};
