import { GameHistory } from "../history";

export interface Game {
  id: number;
  minPoints: number;
  maxPoints: number;
  paragraph: string;
  startedAt: string;
  endedAt: string;
  histories: GameHistory[];
  mode: GameMode;
}

export enum GameMode {
  RANKED = "RANKED",
  CASUAL = "CASUAL",
  PRACTICE = "PRACTICE",
}

export interface TypingStats {
  typos: number;
  charsTyped: number;
  prevError: number | null;
}

export enum RankUpdateStatus {
  PROMOTED = "PROMOTED",
  DEMOTED = "DEMOTED",
}
