"use client";
import { Button } from "@/features/ui/button";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Loader2 } from "lucide-react";
import { GameMode } from "../play/types";

interface JoinGameButtonProps {
  loading: boolean;
  joinGame: (gameMode: GameMode) => Promise<void>;
  gameMode: GameMode;
}

export const JoinGameButton = ({
  loading,
  joinGame,
  gameMode,
}: JoinGameButtonProps) => {
  return (
    <Button disabled={loading} onClick={async () => await joinGame(gameMode)}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Finding game...
        </>
      ) : (
        "Find game"
      )}
      <ArrowRightIcon className="ml-2 h-5 w-5" />
    </Button>
  );
};
