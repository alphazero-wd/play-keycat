"use client";
import { Button } from "@/features/ui/button";
import { Card, CardContent, CardHeader } from "@/features/ui/card";
import { Loader2 } from "lucide-react";
import { useJoinGame } from "./use-join-game";

export const RankedMode = () => {
  const { loading, joinGame } = useJoinGame();
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <h5 className="text-xl font-bold tracking-tight text-card-foreground">
          Ranked match
        </h5>
        <p className="font-normal text-muted-foreground">
          Compete with other players at your rank.
        </p>
      </CardHeader>

      <CardContent>
        <Button disabled={loading} onClick={joinGame}>
          {loading ? <Loader2 className="h-5 w-5" /> : "Join game"}
        </Button>
      </CardContent>
    </Card>
  );
};
