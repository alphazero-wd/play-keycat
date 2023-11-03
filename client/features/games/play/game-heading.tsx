import { useMemo } from "react";
import { useGameStore } from "./hooks";

export const GameHeading = ({
  countdown,
  timeRemaining,
}: {
  countdown: number;
  timeRemaining: number;
}) => {
  const { startedAt } = useGameStore();

  const title = useMemo(() => {
    if (!startedAt) return "Game Lobby";
    if (countdown > 0) return "Game starting...";
    if (timeRemaining > 0) return "Game has flared up 🔥";
    return "Game ended";
  }, [startedAt, countdown, timeRemaining]);

  return (
    <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
      {title}
    </h1>
  );
};
