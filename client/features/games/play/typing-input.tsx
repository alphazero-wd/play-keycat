import { Input } from "@/features/ui/input";
import {
  ChangeEventHandler,
  ClipboardEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
} from "react";
import { useGameStore } from "./hooks";
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
  const startedAt = useGameStore((store) => store.startedAt);
  useEffect(() => {
    if (startedAt && typingInputRef.current) typingInputRef.current.focus();
  }, [startedAt, typingInputRef.current]);

  return (
    <Input
      ref={typingInputRef}
      value={typingStats.value}
      onKeyDown={onKeydown}
      onChange={onChange}
      onPaste={preventCheating}
      className="w-full"
      placeholder="Type when the game starts"
      disabled={!startedAt}
    />
  );
};
