"use client";

import { Button } from "@/features/ui/button";
import { User } from "@/features/users/profile";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { JoinGameButton } from "../lobby";
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
import { Players } from "./players";
import { RankUpdateModal } from "./rank-update-modal";
import { Game } from "./types";
import { TypingInput } from "./typing-input";
import { TypingParagraph } from "./typing-paragraph";

export const Gameplay = ({ user, game }: { user: User; game: Game }) => {
  useGameSocket(game, user.id);
  const { hasFinished, endedAt } = useGameStore();
  const { countdown } = useCountdown();

  const { typingStats, onKeyUp, preventCheating, onChange, onKeyDown } =
    useTyping(game.paragraph, game.id);

  useEndGame(user, typingStats, game);

  return (
    <>
      <RankUpdateModal />
      <GameSummaryModal />
      <div className="container max-w-3xl">
        <GameHeading />
        <GameSubheading />

        <Players user={user} />

        {!hasFinished && isFinite(countdown) && !endedAt && (
          <>
            <TypingParagraph game={game} typingStats={typingStats} />
            <TypingInput
              onChange={onChange}
              onKeyUp={onKeyUp}
              onKeyDown={onKeyDown}
              typingStats={typingStats}
              preventCheating={preventCheating}
            />
          </>
        )}
        <div className="mt-3 flex justify-between gap-x-4">
          <Button variant="outline" asChild>
            <Link
              href={hasFinished || endedAt ? `/games/${game.id}/history` : "/"}
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              {hasFinished || endedAt ? "Go to history" : "Leave game"}
            </Link>
          </Button>
          {(hasFinished || endedAt) && <JoinGameButton />}
        </div>
      </div>
    </>
  );
};
