export enum GameStatus {
  LOBBY = "LOBBY",
  PLAYING = "PLAYING",
  ENDED = "ENDED",
}

export interface Game {
  id: number;
  minPoints: number;
  maxPoints: number;
  status: GameStatus;
  paragraph: string;
  startedAt?: string;
}
