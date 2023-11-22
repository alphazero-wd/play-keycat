"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/ui/card";
import { GameMode } from "../play/types";
import { JoinGameButton } from "./join-game-button";
import { useJoinGame } from "./use-join-game";

export const CasualMode = () => {
  const { loading, joinGame } = useJoinGame(GameMode.CASUAL);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight text-card-foreground">
          Casual match
        </CardTitle>
        <CardDescription className="font-normal text-muted-foreground">
          Still want some flavor from a ranked game with{" "}
          <span className="font-semibold">NO risk</span>? Pick casual mode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JoinGameButton
          gameMode={GameMode.CASUAL}
          loading={loading}
          joinGame={joinGame}
        />
      </CardContent>
    </Card>
  );
};
