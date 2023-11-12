"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/ui/card";
import { JoinGameButton } from "./join-game-button";

export const RankedMode = () => {
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
        <JoinGameButton />
      </CardContent>
    </Card>
  );
};
