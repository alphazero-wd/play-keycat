"use client";
import { Button } from "@/features/ui/button";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Loader2 } from "lucide-react";

export const JoinGameButton = ({
  loading,
  joinGame,
}: {
  loading: boolean;
  joinGame: () => Promise<void>;
}) => {
  return (
    <Button disabled={loading} onClick={joinGame}>
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
