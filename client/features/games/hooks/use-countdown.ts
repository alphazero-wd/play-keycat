import { useState, useEffect } from "react";

export const useCountdown = (playersCount: number) => {
  const [seconds, setSeconds] = useState(10);
  const [hasCountdownStarted, setHasCountdownStarted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (hasCountdownStarted) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else clearInterval(timer);
      }, 1000);
    } else {
      // Clear the interval when hascountdownStarted is false
      if (timer) clearInterval(timer);
    }

    return () => clearInterval(timer); // Clear the interval when the component unmounts
  }, [seconds, hasCountdownStarted]);

  useEffect(() => {
    if (playersCount === 3) setHasCountdownStarted(true);
  }, [playersCount]);

  return { seconds };
};
