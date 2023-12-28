import { useMemo } from "react";
import { useCountdown, useGameStore } from "./hooks";
import { GameMode } from "./types";

export const GameHeading = ({ gameMode }: { gameMode: GameMode }) => {
  const startedAt = useGameStore.use.startedAt();
  const endedAt = useGameStore.use.endedAt();
  const countdown = useCountdown.use.countdown();

  const title = useMemo(() => {
    if (!startedAt && !isFinite(countdown)) {
      if (gameMode === GameMode.PRACTICE) return "Setting things up... 🪄";
      return "Finding players... 🔍";
    }
    if (!startedAt && countdown >= 0) {
      if (countdown <= 3) return "Headstart coming up... 🚀";
      return "Game starting soonly... 🏁";
    }
    if (startedAt && !endedAt && countdown > 0) {
      if (countdown <= 10) return "Game ending soonly ⌛";
      return "Game flared up 🔥";
    }
    return "Game ended ✋";
  }, [startedAt, countdown, endedAt]);

  return (
    <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
      {title}
    </h1>
  );
};
