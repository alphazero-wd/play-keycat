import { User } from "@/features/users/profile";
import { Game } from "../play/types";

export interface GameHistory {
  player: Pick<User, "username" | "id">;
  gameId: string;
  game: Game;
  wpm: number;
  acc: number;
  catPoints: number;
}
