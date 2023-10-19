"use client";

import { useGame } from "../hooks";

export const GameLobby = () => {
  const { isConnected, players } = useGame();

  return (
    <div className="container max-w-3xl">
      <h1 className="mb-1 text-xl font-bold leading-tight tracking-tight text-foreground md:text-2xl">
        Game Lobby
      </h1>

      <p className="font-normal text-secondary-foreground">
        Waiting for opponents...
      </p>

      <div className="space-y-4 mt-6">
        <div className="space-y-4 max-w-2xl">
          {players.map((player) => (
            <div className="flex justify-between items-center">
              <span className="font-medium text-lg">{player.username}</span>
              <span className="text-muted-foreground">0%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
