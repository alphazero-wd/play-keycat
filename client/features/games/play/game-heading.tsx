import { useMemo } from "react";
import { GameMode } from "./types";

interface GameHeadingProps {
  gameMode: GameMode;
  startedAt: string | null;
  endedAt: string | null;
  countdown: number;
}

export const GameHeading = ({
  gameMode,
  startedAt,
  endedAt,
  countdown,
}: GameHeadingProps) => {
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
