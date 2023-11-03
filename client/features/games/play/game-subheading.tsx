import { format } from "date-fns";
import { useMemo } from "react";
import { useGameStore } from "./hooks";

export const GameSubheading = ({
  countdown,
  timeRemaining,
}: {
  countdown: number;
  timeRemaining: number;
}) => {
  const { startedAt } = useGameStore();

  const subtitle = useMemo(() => {
    if (!startedAt) return "Waiting for opponents with similar levels...";
    if (startedAt && countdown > 0)
      return `Game starting in ${countdown} seconds...`;
    if (timeRemaining > 0)
      return `Time remaining ${format(timeRemaining * 1000, "mm:ss")}`;
    return "Game has ended. Showing game history...";
  }, [startedAt, countdown, timeRemaining]);

  return (
    <p className="font-normal text-muted-foreground md:text-lg">{subtitle}</p>
  );
};
