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

export const PracticeMode = () => {
  const { loading, joinGame } = useJoinGame(GameMode.PRACTICE);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight text-card-foreground">
          Practice match
        </CardTitle>
        <CardDescription className="font-normal text-muted-foreground">
          Just want to brush up on your typing skills by yourself? Do some solo
          practice here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JoinGameButton
          gameMode={GameMode.PRACTICE}
          loading={loading}
          joinGame={joinGame}
        />
      </CardContent>
    </Card>
  );
};
