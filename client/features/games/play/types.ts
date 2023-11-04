import { GameHistory } from "../history";

export interface Game {
  id: number;
  minPoints: number;
  maxPoints: number;
  paragraph: string;
  startedAt: string;
  histories: GameHistory[];
}

export interface TypingStats {
  typos: number;
  charsTyped: number;
  prevError: number | null;
  value: string;
}

export enum RankUpdateStatus {
  PROMOTED = "PROMOTED",
  DEMOTED = "DEMOTED",
}
