"use client";

import { Button } from "@/features/ui/button";
import { User } from "@/features/users/profile";
import Link from "next/link";
import { useMemo } from "react";
import { GameHeading } from "./game-heading";
import { GameSubheading } from "./game-subheading";
import {
  useCountdown,
  useEndGame,
  useGameSocket,
  useGameStore,
  useTyping,
} from "./hooks";
import { Players } from "./players";
import { RankUpdateModal } from "./rank-update-modal";
import { Game } from "./types";
import { TypingInput } from "./typing-input";
import { TypingParagraph } from "./typing-paragraph";

export const Gameplay = ({ user, game }: { user: User; game: Game }) => {
  useGameSocket(game.id, user.id);
  const { hasFinished, endedAt } = useGameStore();
  const { countdown } = useCountdown();

  const { typingStats, preventCheating, onChange, onKeydown } = useTyping(
    game.paragraph,
    game.id,
  );

  useEndGame(user, typingStats, game);

  const shouldRender = useMemo(() => {
    return !hasFinished && isFinite(countdown) && !endedAt;
  }, [hasFinished, countdown, endedAt]);

  return (
    <>
      <RankUpdateModal />
      <div className="container max-w-3xl">
        <GameHeading />
        <GameSubheading />

        <Players user={user} />

        {shouldRender && (
          <>
            <TypingParagraph game={game} typingStats={typingStats} />
            <TypingInput
              onChange={onChange}
              onKeydown={onKeydown}
              typingStats={typingStats}
              preventCheating={preventCheating}
            />
          </>
        )}

        <Button className="mt-3" asChild>
          <Link href={hasFinished ? `/games/${game.id}/history` : "/"}>
            {hasFinished ? "Go to history" : "Leave game"}
          </Link>
        </Button>
      </div>
    </>
  );
};
