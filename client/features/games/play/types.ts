import { GameHistory } from "../history";

export interface Game {
  id: number;
  minPoints: number;
  maxPoints: number;
  paragraph: string;
  startedAt: string;
  histories: GameHistory[];
}
