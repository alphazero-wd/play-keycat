"use client";
import { Button } from "@/features/ui/button";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Loader2 } from "lucide-react";
import { useJoinGame } from "./use-join-game";

export const JoinGameButton = () => {
  const { loading, joinGame } = useJoinGame();

  return (
    <Button disabled={loading} onClick={joinGame}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Joining game...
        </>
      ) : (
        "Join game"
      )}
      <ArrowRightIcon className="ml-2 h-5 w-5" />
    </Button>
  );
};
