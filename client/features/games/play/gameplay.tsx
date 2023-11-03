"use client";

import { Button } from "@/features/ui/button";
import { User } from "@/features/users/profile";
import Link from "next/link";
import { useEffect } from "react";
import { GameHeading } from "./game-heading";
import { GameSubheading } from "./game-subheading";
import {
  averagePlayerCPs,
  useCountdown,
  useEndGame,
  useGameSocket,
  useGameStore,
  usePlayersStore,
  useRankUpdateModal,
  useTyping,
} from "./hooks";
import { Players } from "./players";
import { RankUpdateModal } from "./rank-update-modal";
import { Game } from "./types";
import { TypingInput } from "./typing-input";
import { TypingParagraph } from "./typing-paragraph";
import { calculateTimeLimit } from "./utils";

export const Gameplay = ({ user, game }: { user: User; game: Game }) => {
  useGameSocket(game.id);
  const { players } = usePlayersStore();
  const { hasFinished, startedAt } = useGameStore();
  const { isModalOpen, onClose } = useRankUpdateModal();
  const { countdown, startCountdown } = useCountdown();
  const { countdown: timeRemaining, startCountdown: startTimeLimit } =
    useCountdown();

  const { typingStats, preventCheating, onChange, onKeydown } = useTyping(
    game.paragraph,
    game.id,
  );
  const { userGameHistory } = useEndGame(
    user,
    typingStats,
    game,
    timeRemaining,
  );

  useEffect(() => {
    if (players.length === 3) startCountdown(10);
  }, [players.length]);

  useEffect(() => {
    if (countdown === 0) {
      const timeLimit = calculateTimeLimit(averagePlayerCPs, game.paragraph);
      startTimeLimit(timeLimit);
    }
  }, [countdown]);

  return (
    <>
      <RankUpdateModal
        isOpen={isModalOpen}
        onClose={onClose}
        user={user}
        catPoints={userGameHistory.catPoints}
      />
      <div className="container max-w-3xl">
        <GameHeading timeRemaining={timeRemaining} countdown={countdown} />
        <GameSubheading timeRemaining={timeRemaining} countdown={countdown} />

        <Players user={user} />

        {startedAt && !hasFinished && (
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
          <Link href="/">Leave game</Link>
        </Button>
      </div>
    </>
  );
};
