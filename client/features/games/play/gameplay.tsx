"use client";

import { Button } from "@/features/ui/button";
import { User } from "@/features/users/profile";
import Link from "next/link";
import { useEffect } from "react";
import { GameHeading } from "./game-heading";
import { GameSubheading } from "./game-subheading";
import {
  useCountdown,
  useEndGame,
  useGameSocket,
  useGameStore,
  usePlayersStore,
  useTyping,
} from "./hooks";
import { Players } from "./players";
import { RankUpdateModal } from "./rank-update-modal";
import { Game } from "./types";
import { TypingInput } from "./typing-input";
import { TypingParagraph } from "./typing-paragraph";
import { calculateAverageCPs, calculateTimeLimit } from "./utils";

export const Gameplay = ({ user, game }: { user: User; game: Game }) => {
  useGameSocket(game.id);
  const { players } = usePlayersStore();
  const { hasFinished, startedAt } = useGameStore();
  const { countdown, startCountdown } = useCountdown();
  const { countdown: timeRemaining, startCountdown: startTimeLimit } =
    useCountdown();

  const { typingStats, preventCheating, onChange, onKeydown } = useTyping(
    game.paragraph,
    game.id,
  );

  useEndGame(user, typingStats, game, timeRemaining);

  useEffect(() => {
    if (players.length === 3) startCountdown(10);
  }, [players.length]);

  useEffect(() => {
    if (countdown === 0) {
      const timeLimit = calculateTimeLimit(
        calculateAverageCPs(players),
        game.paragraph,
      );
      startTimeLimit(timeLimit);
    }
  }, [countdown]);

  return (
    <>
      <RankUpdateModal />
      <div className="container max-w-3xl">
        <GameHeading timeRemaining={timeRemaining} countdown={countdown} />
        <GameSubheading timeRemaining={timeRemaining} countdown={countdown} />

        <Players user={user} />

        {startedAt && !hasFinished && timeRemaining !== 0 && (
          <>
            <TypingParagraph game={game} typingStats={typingStats} />
            <TypingInput
              onChange={onChange}
              onKeydown={onKeydown}
              typingStats={typingStats}
              preventCheating={preventCheating}
              countdown={countdown}
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
