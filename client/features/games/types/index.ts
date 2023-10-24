import { User } from "@/features/users/types";

export interface Game {
  id: number;
  minPoints: number;
  maxPoints: number;
  paragraph: string;
  startedAt: string;
  histories: GameHistory[];
}

export interface GameHistory {
  player: User;
  wpm: number;
  acc: number;
  timeTaken: number;
}
