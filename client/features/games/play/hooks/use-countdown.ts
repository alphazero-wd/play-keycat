import { addSeconds } from "date-fns";
import { useCallback } from "react";
import { useTimer } from "react-timer-hook";

export const useCountdown = () => {
  const { restart, totalSeconds } = useTimer({
    expiryTimestamp: addSeconds(new Date(), 1e9),
  });

  const startCountdown = useCallback((seconds: number) => {
    restart(addSeconds(new Date(), seconds));
  }, []);

  return { startCountdown, countdown: totalSeconds };
};
