"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useGame } from "../hooks";
import { GameStatus } from "../types";
import { useStopwatch, useTimer } from "react-timer-hook";
import { Input } from "@/features/ui";
import { addSeconds } from "date-fns";

export const GameLobby = () => {
  const { players, game } = useGame();

  const {
    seconds,
    minutes,
    start: startTimer,
  } = useStopwatch({ autoStart: false });

  const { totalSeconds: countdown, start: startCountdown } = useTimer({
    autoStart: false,
    expiryTimestamp: addSeconds(new Date(), 10),
    onExpire: startTimer,
  });

  useEffect(() => {
    if (players.length === 3) startCountdown();
  }, [players.length]);

  const displayTitle = useCallback(() => {
    if (!game?.status) return "Game Lobby";
    if (game.status === GameStatus.PLAYING && countdown > 0)
      return "Game starting...";
    if (countdown === 0) return "Game has flared up 🔥";
    return "Game ended";
  }, [game?.status, countdown]);

  const displaySubtitle = useCallback(() => {
    if (!game?.status) return "Waiting for opponents...";
    if (game.status === GameStatus.PLAYING && countdown > 0)
      return `Game starting in ${countdown} seconds...`;
    if (countdown === 0)
      return `Time elapsed ${minutes}:${(seconds < 10 ? "0" : "") + seconds}`;
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
      <p className="my-4 text-lg text-secondary-foreground">
        {game?.paragraph}
      </p>
      {game?.status === GameStatus.PLAYING && (
        <Input
          className="w-full"
          placeholder="Type when the game starts"
          disabled={countdown > 0}
        />
      )}
    </div>
  );
};
