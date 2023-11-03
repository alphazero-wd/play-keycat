import { useAlert } from "@/features/ui/alert";
import { socket } from "@/lib/socket";
import {
  ChangeEventHandler,
  ClipboardEventHandler,
  KeyboardEventHandler,
  useCallback,
  useState,
} from "react";
import { TypingStats } from "../types";
import { calculateProgress, isSpecialKeyPressed } from "../utils";

export const useTyping = (paragraph: string, gameId: number) => {
  const [typingStats, setTypingStats] = useState<TypingStats>({
    typos: 0,
    charsTyped: 0,
    prevError: null,
    value: "",
  });
  const { setAlert } = useAlert();

  const updateTypingStats = useCallback((updated: Partial<TypingStats>) => {
    setTypingStats((prevStats) => ({ ...prevStats, ...updated }));
  }, []);

  const preventCheating: ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    updateTypingStats({ value: e.target.value });

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Backspace") {
      if (typingStats.prevError === null) e.preventDefault();
      else {
        updateTypingStats({
          charsTyped: typingStats.charsTyped - 1,
          prevError: null,
        });
      }
    } else if (!isSpecialKeyPressed(e.key) && typingStats.prevError === null) {
      if (paragraph[typingStats.charsTyped] === e.key) {
        if (e.key === " ") {
          socket.emit("progress", {
            progress: calculateProgress(typingStats.charsTyped, paragraph),
            gameId,
          });
          updateTypingStats({ value: "" });
        }
      } else {
        updateTypingStats({
          typos: typingStats.typos + 1,
          prevError: typingStats.charsTyped,
        });
      }

      updateTypingStats({ charsTyped: typingStats.charsTyped + 1 });
    } else {
      e.preventDefault();
      if (typingStats.prevError)
        setAlert("error", "You need to correct the typos before continuing");
    }
  };

  return {
    onChange,
    onKeydown,
    preventCheating,
    typingStats,
  };
};
