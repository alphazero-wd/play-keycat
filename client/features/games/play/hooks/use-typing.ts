import { SPECIAL_CHARACTERS_REGEX } from "@/features/constants";
import { useAlert } from "@/features/ui/alert";
import { User } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import {
  ChangeEventHandler,
  ClipboardEventHandler,
  KeyboardEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import { TypingStats } from "../types";
import { calculateProgress } from "../utils";
import { useTypingStats } from "./use-typing-stats";

export const useTyping = (paragraph: string, gameId: number, user: User) => {
  const [typingStats, setTypingStats] = useState<TypingStats>({
    typos: 0,
    charsTyped: 0,
    prevError: null,
    wordsTyped: 0,
    value: "",
  });
  const { wpm, pos } = useTypingStats(typingStats, user);
  const words = useMemo(() => paragraph.split(" "), [paragraph]);
  const { setAlert } = useAlert();
  const [prevKeyPressed, setPrevKeyPressed] = useState<Set<string>>(new Set());

  const updateTypingStats = useCallback((updated: Partial<TypingStats>) => {
    setTypingStats((prevStats) => ({ ...prevStats, ...updated }));
  }, []);

  const preventCheating: ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    updateTypingStats({ value });
    if (!value) return;
    if (!words[typingStats.wordsTyped].startsWith(value)) {
      updateTypingStats({
        prevError: typingStats.charsTyped,
        typos: typingStats.typos + 1,
      });
    }
    // handling space
    const hasSpaceEntered =
      paragraph[typingStats.charsTyped] === " " && value.at(-1) !== " ";
    const prevValue = typingStats.value;
    if (
      (paragraph[typingStats.charsTyped] !== " " || hasSpaceEntered) &&
      value.length > prevValue.length
    )
      updateTypingStats({ charsTyped: typingStats.charsTyped + 1 });
  };

  const onKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
    setPrevKeyPressed((prev) => {
      prev.delete(e.key);
      return new Set(prev);
    });
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    setPrevKeyPressed((prev) => new Set(prev).add(e.key));
    if (e.key === "Backspace") {
      if (
        !typingStats.value ||
        (paragraph[typingStats.charsTyped - 1] === " " &&
          typingStats.prevError === null)
      ) {
        e.preventDefault();
        return;
      }

      const isControlBackspacePressed = prevKeyPressed.has("Control");
      const endInSpecialCharacter = SPECIAL_CHARACTERS_REGEX.test(
        typingStats.value.at(-1)!,
      );
      if (isControlBackspacePressed && !endInSpecialCharacter) {
        updateTypingStats({
          charsTyped: typingStats.charsTyped - typingStats.value.length,
        });
      } else updateTypingStats({ charsTyped: typingStats.charsTyped - 1 });
      updateTypingStats({ prevError: null });
      return;
    }
    if (typingStats.prevError !== null) {
      e.preventDefault();
      setAlert("error", "You need to correct the typo before continuing");
      return;
    }
    if (e.key === " ") {
      if (words[typingStats.wordsTyped] === typingStats.value) {
        e.preventDefault();
        updateTypingStats({
          value: "",
          wordsTyped: typingStats.wordsTyped + 1,
        });
        socket.emit("progress", {
          progress: calculateProgress(typingStats.charsTyped, paragraph),
          wpm,
          pos,
          gameId,
        });
        updateTypingStats({ charsTyped: typingStats.charsTyped + 1 });
      } else {
        updateTypingStats({
          prevError: typingStats.charsTyped,
          typos: typingStats.typos + 1,
        });
      }
    }
  };

  return {
    onChange,
    onKeyDown,
    preventCheating,
    onKeyUp,
    typingStats,
  };
};
