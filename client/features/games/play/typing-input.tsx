import { Input } from "@/features/ui/input";
import {
  ChangeEventHandler,
  ClipboardEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
} from "react";
import { useCountdown } from "./hooks";
import { TypingStats } from "./types";

interface TypingInputProps {
  typingStats: TypingStats;
  onKeydown: KeyboardEventHandler<HTMLInputElement>;
  preventCheating: ClipboardEventHandler<HTMLInputElement>;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export const TypingInput = ({
  typingStats,
  onChange,
  onKeydown,
  preventCheating,
}: TypingInputProps) => {
  const typingInputRef = useRef<HTMLInputElement>(null);
  const { countdown } = useCountdown();
  useEffect(() => {
    if (countdown === 0 && typingInputRef.current)
      typingInputRef.current.focus();
  }, [countdown, typingInputRef.current]);

  return (
    <Input
      ref={typingInputRef}
      value={typingStats.value}
      onKeyDown={onKeydown}
      onChange={onChange}
      onPaste={preventCheating}
      className="w-full"
      placeholder="Type when the game starts"
      disabled={!isFinite(countdown)}
    />
  );
};
