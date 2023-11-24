"use client";

import { Button } from "@/features/ui/button";
import { User } from "@/features/users/profile";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { JoinGameButton, useJoinGame } from "../lobby";
import { GameHeading } from "./game-heading";
import { GameSubheading } from "./game-subheading";
import { GameSummaryModal } from "./game-summary-modal";
import {
  useCountdown,
  useEndGame,
  useGameSocket,
  useGameStore,
  useTyping,
} from "./hooks";
import { LevelUpModal } from "./level-up-modal";
import { Players } from "./players";
import { RankUpdateModal } from "./rank-update-modal";
import { Game } from "./types";
import { TypingParagraph } from "./typing-paragraph";

export const Gameplay = ({ user, game }: { user: User; game: Game }) => {
  useGameSocket(game);
  const { loading, joinGame } = useJoinGame(game.mode);
  const hasFinished = useGameStore.use.hasFinished();
  const endedAt = useGameStore.use.endedAt();

  const countdown = useCountdown.use.countdown();

  const typingStats = useTyping(game.paragraph, game.id);

  useEndGame(user, typingStats, game);
  return (
    <>
      <LevelUpModal gameMode={game.mode} user={user} />
      <RankUpdateModal />
      <GameSummaryModal gameMode={game.mode} />
      <div className="container max-w-3xl">
        <GameHeading gameMode={game.mode} />
        <GameSubheading gameMode={game.mode} />

        <Players gameMode={game.mode} user={user} />

        {!hasFinished && isFinite(countdown) && !endedAt && (
          <>
            <TypingParagraph game={game} typingStats={typingStats} />
          </>
        )}
        <div className="mt-3 flex justify-between gap-x-4">
          <Button variant="outline" asChild>
            <Link
              href={hasFinished || endedAt ? `/games/${game.id}/history` : "/"}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {hasFinished || endedAt ? "Go to history" : "Leave game"}
            </Link>
          </Button>
          {(hasFinished || endedAt) && (
            <JoinGameButton
              gameMode={game.mode}
              loading={loading}
              joinGame={joinGame}
            />
          )}
        </div>
      </div>
    </>
  );
};
