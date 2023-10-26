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
  gameId: number;
  game: Game;
  wpm: number;
  acc: number;
  timeTaken: number;
  catPoints: number;
}
