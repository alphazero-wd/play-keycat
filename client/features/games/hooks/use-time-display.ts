import { addSeconds, format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useTimer } from "react-timer-hook";
import { Game } from "../types";
import { calculateTimeLimit } from "../utils";

export const useTimeDisplay = (game: Game | null, averageCPs: number) => {
  const [timeLimit, setTimeLimit] = useState(1e9);
  const { totalSeconds: timeRemaining, restart: startTimeLimit } = useTimer({
    autoStart: false,
    expiryTimestamp: new Date(),
  });

  const { totalSeconds: countdown, start: startCountdown } = useTimer({
    autoStart: false,
    expiryTimestamp: addSeconds(new Date(), 10),
    onExpire: () => {
      startTimeLimit(addSeconds(new Date(), 10 + timeLimit));
    },
  });

  useEffect(() => {
    if (game?.paragraph) {
      const timeLimitWpmBased = calculateTimeLimit(averageCPs, game.paragraph);
      setTimeLimit(timeLimitWpmBased);
    }
  }, [game?.paragraph]);

  const title = useMemo(() => {
    if (!game?.startedAt) return "Game Lobby";
    if (game && countdown > 0) return "Game starting...";
    if (timeRemaining > 0) return "Game has flared up 🔥";
    return "Game ended";
  }, [game?.startedAt, countdown, timeRemaining]);

  const subtitle = useMemo(() => {
    if (!game?.startedAt) return "Waiting for opponents with similar levels...";
    if (game.startedAt && countdown > 0)
      return `Game starting in ${countdown} seconds...`;
    if (timeRemaining > 0)
      return `Time remaining ${format(timeRemaining * 1000, "mm:ss")}`;
    return "Game has ended. Showing game history...";
  }, [game?.startedAt, countdown, timeRemaining]);

  return {
    startCountdown,
    title,
    subtitle,
    countdown,
    timeRemaining,
  };
};
