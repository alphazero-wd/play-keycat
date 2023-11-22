"use client";
import { GameModeButton } from "@/features/ui/button";
import { Loader } from "@/features/ui/loader";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { GameMode } from "../play/types";

interface JoinGameButtonProps {
  loading: boolean;
  joinGame: () => Promise<void>;
  gameMode: GameMode;
}

export const JoinGameButton = ({
  loading,
  joinGame,
  gameMode,
}: JoinGameButtonProps) => {
  return (
    <GameModeButton gameMode={gameMode} disabled={loading} onClick={joinGame}>
      {loading ? (
        <>
          <Loader />
          Finding game...
        </>
      ) : (
        "Find game"
      )}
      <ArrowRightIcon className="ml-2 h-4 w-4" />
    </GameModeButton>
  );
};
