"use client";

import { Button, Input } from "@/features/ui";
import { addSeconds, differenceInMilliseconds } from "date-fns";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGame, useTimeDisplay, useTyping } from "../hooks";
import { socket } from "@/lib/socket";
import {
  calculateAccuracy,
  calculateCPs,
  calculateProgress,
  calculateWpm,
  determinePosition,
} from "../utils";
import Link from "next/link";
import { User } from "@/features/users/types";
import { useRouter } from "next/navigation";
import { useAlert } from "@/features/layout/alert";

export const Gameplay = ({ user }: { user: User }) => {
  const { players, game, isGameOver, setIsGameOver, playersProgress } =
    useGame();
  const {
    typos,
    value,
    prevError,
    charsTyped,
    preventCheating,
    onChange,
    onKeydown,
  } = useTyping(game?.paragraph || "");

  const averagePlayerCPs = useMemo(() => {
    const totalPlayerCPs = players.reduce(
      (sum, player) => (sum += player.catPoints),
      0
    );
    return +(totalPlayerCPs / players.length).toFixed(0);
  }, [players]);

  const { startCountdown, title, subtitle, timeRemaining, countdown } =
    useTimeDisplay(game, averagePlayerCPs);

  const router = useRouter();
  const { setAlert } = useAlert();
  const typingInputRef = useRef<HTMLInputElement>(null);
  const sendResult = useCallback(() => {
    if (game) {
      const startedAt = addSeconds(new Date(game.startedAt), 10);
      const timeTaken = differenceInMilliseconds(new Date(), startedAt);
      socket.emit("progress", {
        progress: calculateProgress(charsTyped, game!.paragraph),
      });
      if (playersProgress[user.id] >= 50) {
        const acc = calculateAccuracy(typos, charsTyped);
        const wpm = calculateWpm(charsTyped, timeTaken);
        socket.emit("playerFinished", {
          wpm,
          acc,
          catPoints: calculateCPs(
            wpm,
            acc,
            players.length,
            determinePosition(playersProgress, user.id)
          ),
          timeTaken,
        });
      }
    }
  }, [charsTyped, game?.paragraph]);

  useEffect(() => {
    if (game && countdown === 0) typingInputRef.current?.focus();
  }, [countdown, game]);

  useEffect(() => {
    if (players.length === 3) startCountdown();
  }, [players.length]);

  useEffect(() => {
    const hasReachedTheEnd =
      game?.paragraph && charsTyped === game?.paragraph.length;
    if (hasReachedTheEnd) {
      setIsGameOver(true);
      sendResult();
    }
  }, [game?.paragraph, charsTyped, sendResult]);

  useEffect(() => {
    const hasTimeup =
      game && countdown === 0 && !isGameOver && timeRemaining === 0;
    if (hasTimeup) {
      setIsGameOver(true);
      sendResult();
    }
  }, [game, timeRemaining, isGameOver, sendResult]);

  useEffect(() => {
    if (game && timeRemaining === 0 && isGameOver) {
      typingInputRef.current?.blur();
      const timeout = setTimeout(() => {
        if (playersProgress[user.id] >= 50)
          router.push(`/games/${game.id}/history`);
        else {
          setAlert(
            "info",
            "Your progress is not saved because it is below 50%"
          );
          router.push("/");
        }
        router.refresh();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, isGameOver]);

  return (
    <div className="container max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      <p className="font-normal md:text-lg text-muted-foreground">{subtitle}</p>

      <div className="space-y-4 mt-6">
        <div className="space-y-4 max-w-2xl">
          {players.map((player) => (
            <div key={player.id} className="flex justify-between items-center">
              <span className="font-medium text-lg">
                {player.username} {player.id === user.id && "(you)"}
              </span>
              <span className="text-muted-foreground">
                {playersProgress[player.id] || 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
      {!isGameOver && (
        <>
          {game?.paragraph && (
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
          )}
          {game?.startedAt && (
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
          )}
        </>
      )}

      <Button className="mt-3" asChild>
        <Link href="/">Leave game</Link>
      </Button>
    </div>
  );
};
