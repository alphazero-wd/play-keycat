import { useAlert } from "@/features/ui/alert";
import { socket } from "@/lib/socket";
import {
  ChangeEventHandler,
  ClipboardEventHandler,
  KeyboardEventHandler,
  useState,
} from "react";
import { calculateProgress, isSpecialKeyPressed } from "../utils";

export const useTyping = (paragraph: string, gameId: number) => {
  const [typos, setTypos] = useState(0);
  const { setAlert } = useAlert();
  const [charsTyped, setCharsTyped] = useState(0);
  const [prevError, setPrevError] = useState<number | null>(null);
  const [value, setValue] = useState("");

  const preventCheating: ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setValue(e.target.value);

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Backspace") {
      if (prevError === null) e.preventDefault();
      else {
        setCharsTyped((c) => c - 1);
        setPrevError(null);
      }
    } else if (!isSpecialKeyPressed(e.key) && prevError === null) {
      if (paragraph[charsTyped] === e.key) {
        if (e.key === " ") {
          socket.emit("progress", {
            progress: calculateProgress(charsTyped, paragraph),
            gameId,
          });
          setValue("");
        }
      } else {
        setTypos((t) => t + 1);
        setPrevError(() => charsTyped);
      }

      setCharsTyped((c) => c + 1);
    } else {
      e.preventDefault();
      if (prevError)
        setAlert("error", "You need to correct the typos before continuing");
    }
  };

  return {
    value,
    typos,
    charsTyped,
    onChange,
    onKeydown,
    preventCheating,
    prevError,
  };
};
