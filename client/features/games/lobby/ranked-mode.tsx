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

export const RankedMode = () => {
  const { loading, joinGame } = useJoinGame();
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight text-card-foreground">
          Ranked match
        </CardTitle>
        <CardDescription className="font-normal text-muted-foreground">
          Compete with other players at your rank.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JoinGameButton
          gameMode={GameMode.RANKED}
          loading={loading}
          joinGame={joinGame}
        />
      </CardContent>
    </Card>
  );
};
