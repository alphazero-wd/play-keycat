import { User } from "@/features/users/profile";
import { Game } from "../play";

export interface GameHistory {
  player: User;
  gameId: string;
  game: Game;
  wpm: number;
  acc: number;
  timeTaken: number;
  catPoints: number;
}
