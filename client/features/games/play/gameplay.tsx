"use client";

import { ranks } from "@/features/data";
import { useAlert } from "@/features/ui/alert";
import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { ProfileCard, User, getCurrentRank } from "@/features/users/profile";
import { socket } from "@/lib/socket";
import { differenceInMilliseconds } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useGame, useTimeDisplay, useTyping } from "./hooks";
import { Game } from "./types";
import {
  calculateAccuracy,
  calculateCPs,
  calculateProgress,
  calculateWpm,
  determinePosition,
} from "./utils";

export const Gameplay = ({ user, game }: { user: User; game: Game }) => {
  const { players, startedAt, isGameOver, setIsGameOver, playersProgress } =
    useGame(game.id);
  const {
    typos,
    value,
    prevError,
    charsTyped,
    preventCheating,
    onChange,
    onKeydown,
  } = useTyping(game.paragraph, game.id);

  const averagePlayerCPs = useMemo(() => {
    const totalPlayerCPs = players.reduce(
      (sum, player) => (sum += player.catPoints),
      0,
    );
    return +(totalPlayerCPs / players.length).toFixed(0);
  }, [players]);

  const { startCountdown, title, subtitle, timeRemaining, countdown } =
    useTimeDisplay(game, startedAt, averagePlayerCPs);

  const router = useRouter();
  const { setAlert } = useAlert();
  const typingInputRef = useRef<HTMLInputElement>(null);
  const sendResult = useCallback(() => {
    const timeTaken = differenceInMilliseconds(new Date(), startedAt!);
    socket.emit("progress", {
      progress: calculateProgress(charsTyped, game!.paragraph),
      gameId: game.id,
    });
    if (playersProgress[user.id] >= 50) {
      const averageRank = getCurrentRank(averagePlayerCPs);
      const acc = calculateAccuracy(typos, charsTyped);
      const wpm = calculateWpm(charsTyped, timeTaken);
      socket.emit("playerFinished", {
        wpm,
        acc,
        catPoints: calculateCPs(
          wpm - ranks[averageRank].minAcc,
          acc - ranks[averageRank].minWpm,
          players.length,
          determinePosition(playersProgress, user.id),
        ),
        timeTaken,
        gameId: game.id,
      });
    }
  }, [charsTyped, game.paragraph]);

  useEffect(() => {
    if (startedAt && countdown === 0) typingInputRef.current?.focus();
  }, [countdown, startedAt]);

  useEffect(() => {
    if (players.length === 3) startCountdown();
  }, [players.length]);

  useEffect(() => {
    const hasReachedTheEnd = startedAt && charsTyped === game.paragraph.length;
    if (hasReachedTheEnd) {
      setIsGameOver(true);
      sendResult();
    }
  }, [startedAt, game.paragraph, charsTyped, sendResult]);

  useEffect(() => {
    const hasTimeup =
      startedAt && countdown === 0 && !isGameOver && timeRemaining === 0;
    if (hasTimeup) {
      setIsGameOver(true);
      sendResult();
    }
  }, [startedAt, timeRemaining, isGameOver, sendResult]);

  useEffect(() => {
    if (startedAt && timeRemaining === 0 && isGameOver) {
      typingInputRef.current?.blur();
      const timeout = setTimeout(() => {
        if (playersProgress[user.id] >= 50)
          router.push(`/games/${game.id}/history`);
        else {
          setAlert(
            "info",
            "Your progress is not saved because it is below 50%",
          );
          router.push("/");
        }
        router.refresh();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, startedAt, isGameOver]);

  return (
    <div className="container max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      <p className="font-normal text-muted-foreground md:text-lg">{subtitle}</p>

      <div className="mt-6 max-w-2xl space-y-4">
        {players.map((player) => (
          <div key={player.id} className="flex items-center justify-between">
            <div className="flex w-[200px] items-center justify-between">
              <ProfileCard player={player} userId={user.id} />
              <Avatar
                className="transition-transform"
                style={{
                  transform: `translateX(${
                    (playersProgress[player.id] || 0) * 10
                  }%)`,
                }}
              >
                <AvatarImage src="/icons/sprout.jpg" />
                <AvatarFallback>
                  {player.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <span className="flex-shrink-0 text-muted-foreground">
              {playersProgress[player.id] || 0}%
            </span>
          </div>
        ))}
      </div>
      {startedAt && !isGameOver && (
        <>
          <p className="my-4 text-lg text-secondary-foreground">
            {game.paragraph
              .substring(0, charsTyped)
              .split("")
              .map((char, index) => (
                <span
                  className={
                    prevError === index ? "bg-red-200" : "bg-green-200"
                  }
                >
                  {char}
                </span>
              ))}
            {game.paragraph.substring(charsTyped)}
          </p>
          <Input
            ref={typingInputRef}
            value={value}
            onKeyDown={onKeydown}
            onChange={onChange}
            onPaste={preventCheating}
            className="w-full"
            placeholder="Type when the game starts"
            disabled={countdown > 0}
          />
        </>
      )}

      <Button className="mt-3" asChild>
        <Link href="/">Leave game</Link>
      </Button>
    </div>
  );
};
