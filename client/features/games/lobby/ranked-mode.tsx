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
  const { loading, joinGame } = useJoinGame(GameMode.RANKED);
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight text-card-foreground">
          Ranked match
        </CardTitle>
        <CardDescription className="font-normal text-muted-foreground">
          Want to compete against other typists for the 🌈? It&apos;s waiting
          for &apos;ya to be attained.
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
