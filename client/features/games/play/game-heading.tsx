import { useMemo } from "react";
import { useCountdown, useGameStore } from "./hooks";

export const GameHeading = () => {
  const { countdown } = useCountdown();
  const { startedAt, endedAt } = useGameStore();

  const title = useMemo(() => {
    if (!startedAt && !isFinite(countdown)) return "Game Lobby";
    if (!startedAt && countdown >= 0) return "Game starting...";
    if (startedAt && !endedAt && countdown > 0) return "Game has flared up 🔥";
    return "Game ended";
  }, [startedAt, countdown]);

  return (
    <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
      {title}
    </h1>
  );
};