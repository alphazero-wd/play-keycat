"use client";

import { useCallback } from "react";
import { useCountdown, useGame } from "../hooks";
import { GameStatus } from "../types";

export const GameLobby = () => {
  const { players, game } = useGame();
  const { seconds } = useCountdown(players.length);

  const displayTitle = useCallback(() => {
    if (!game?.status) return "Game Lobby";
    if (game.status === GameStatus.PLAYING && seconds > 0)
      return "Game starting...";
    if (seconds === 0) return "Game started";
    return "Game ended";
  }, [game?.status, seconds]);

  const displaySubtitle = useCallback(() => {
    if (!game?.status) return "Waiting for opponents...";
    if (game.status === GameStatus.PLAYING && seconds > 0)
      return `Game starting in ${seconds} seconds...`;
    if (seconds === 0) return "Game has flared up 🔥🔥🔥";
    return "Game has ended. Showing game history";
  }, [game?.status, seconds]);

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
    </div>
  );
};
