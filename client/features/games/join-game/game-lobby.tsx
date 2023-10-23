"use client";

import { Input } from "@/features/ui";
import { addSeconds, differenceInMilliseconds, format } from "date-fns";
import { useCallback, useEffect } from "react";
import { useGame, useTimeDisplay, useTyping } from "../hooks";
import { socket } from "@/lib/socket";
import { calculateAccuracy, calculateProgress, calculateWpm } from "../utils";

export const GameLobby = () => {
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

  const { startCountdown, title, subtitle, timeRemaining, countdown } =
    useTimeDisplay(game);

  useEffect(() => {
    if (players.length === 3) startCountdown();
  }, [players.length]);

  const sendResult = useCallback(() => {
    if (game) {
      const startedAt = addSeconds(new Date(game.startedAt), 10);
      const timeTaken = differenceInMilliseconds(new Date(), startedAt);
      socket.emit("progress", {
        progress: calculateProgress(charsTyped, game!.paragraph),
      });
      socket.emit("playerFinished", {
        acc: calculateAccuracy(typos, charsTyped),
        wpm: calculateWpm(charsTyped, timeTaken),
        timeTaken,
      });
    }
  }, [charsTyped, game?.paragraph]);

  useEffect(() => {
    if (game?.paragraph && charsTyped === game?.paragraph.length) {
      setIsGameOver(true);
      sendResult();
    }
  }, [game?.paragraph, charsTyped, sendResult]);

  useEffect(() => {
    if (game && countdown === 0 && !isGameOver && timeRemaining === 0) {
      setIsGameOver(true);
      sendResult();
    }
  }, [game, timeRemaining, isGameOver, sendResult]);

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
              <span className="font-medium text-lg">{player.username}</span>
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
    </div>
  );
};
