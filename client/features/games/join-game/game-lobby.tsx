"use client";

import { useCallback, useEffect } from "react";
import { useGame, useTyping } from "../hooks";
import { GameStatus } from "../types";
import { useTimer } from "react-timer-hook";
import { Input } from "@/features/ui";
import { addSeconds } from "date-fns";

export const GameLobby = () => {
  const { players, game } = useGame();
  const { value, prevError, charsTyped, preventCheating, onChange, onKeydown } =
    useTyping(game?.paragraph || "");

  const {
    totalSeconds: timeRemaining,
    minutes,
    seconds,
    restart: startTimeLimit,
  } = useTimer({
    autoStart: false,
    expiryTimestamp: new Date(),
  });

  const { totalSeconds: countdown, start: startCountdown } = useTimer({
    autoStart: false,
    expiryTimestamp: addSeconds(new Date(), 10),
    onExpire: () => {
      startTimeLimit(
        addSeconds(
          new Date(),
          Math.trunc((game!.paragraph.length / 5 / 39) * 60)
        )
      );
    },
  });

  useEffect(() => {
    if (players.length === 3) startCountdown();
  }, [players.length]);

  const displayTitle = useCallback(() => {
    if (!game?.status) return "Game Lobby";
    if (game.status === GameStatus.PLAYING && countdown > 0)
      return "Game starting...";
    if (timeRemaining > 0) return "Game has flared up 🔥";
    return "Game ended";
  }, [game?.status, countdown]);

  const displaySubtitle = useCallback(() => {
    if (!game?.status) return "Waiting for opponents...";
    if (game.status === GameStatus.PLAYING && countdown > 0)
      return `Game starting in ${countdown} seconds...`;
    if (timeRemaining > 0)
      return `Time remaining ${minutes}:${(seconds < 10 ? "0" : "") + seconds}`;
    return "Game has ended. Showing game history";
  }, [game?.status, countdown, minutes, seconds]);

  return (
    <div className="container max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
        {displayTitle()}
      </h1>
      <p className="font-normal md:text-lg text-muted-foreground">
        {displaySubtitle()}
      </p>

      <div className="space-y-4 mt-6">
        <div className="space-y-4 max-w-2xl">
          {players.map((player) => (
            <div key={player.id} className="flex justify-between items-center">
              <span className="font-medium text-lg">{player.username}</span>
              <span className="text-muted-foreground">0%</span>
            </div>
          ))}
        </div>
      </div>
      {game?.paragraph && (
        <p className="my-4 text-lg text-secondary-foreground">
          {game.paragraph
            .substring(0, charsTyped)
            .split("")
            .map((char, index) => (
              <span
                className={prevError === index ? "bg-red-200" : "bg-green-200"}
              >
                {char}
              </span>
            ))}
          {game.paragraph.substring(charsTyped)}
        </p>
      )}
      {game?.status === GameStatus.PLAYING && (
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
    </div>
  );
};
