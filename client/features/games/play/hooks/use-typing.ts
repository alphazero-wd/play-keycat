"use client";
import { useAlert } from "@/features/ui/alert";
import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";
import { calculateProgress, calculateWpm } from "../calculate-typing";
import { useGameStore } from "./use-game-store";

export const useTyping = (paragraph: string, gameId: string) => {
  const startedAt = useGameStore.use.startedAt();
  const [typos, setTypos] = useState(0);
  const [prevError, setPrevError] = useState<number | null>(null);
  const [charsTyped, setCharsTyped] = useState(0);

  const setAlert = useAlert.use.setAlert();

  const onKeyDown = (e: globalThis.KeyboardEvent) => {
    if (!startedAt && e.key.length === 1) {
      setAlert(
        "error",
        "You have to wait until the countdown is over before typing",
      );
      return;
    }
    if (e.key === "Backspace") {
      if (prevError === null) return;

      setCharsTyped((prev) => prev - 1);
      setPrevError(() => null);
      return;
    }
    const isCapsLockOn = e.getModifierState("CapsLock");
    if (isCapsLockOn) setAlert("warning", "Your Caps Lock key is ON");
    if (e.key.length > 1) return;

    if (prevError !== null) {
      setAlert("error", "You need to correct the typo before continuing");
      return;
    }
    if (e.key === paragraph[charsTyped]) {
      if (e.key === " ") {
        socket.emit("progress", {
          progress: calculateProgress(charsTyped, paragraph),
          wpm: calculateWpm(charsTyped, new Date(startedAt!)),
          gameId,
        });
      }
    } else {
      setPrevError(charsTyped);
      setTypos((prev) => prev + 1);
    }
    setCharsTyped((prev) => prev + 1);
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [startedAt, typos, prevError, charsTyped]);

  return { typos, prevError, charsTyped };
};
