export interface User {
  id: number;
  username: string;
  joinedAt: string;
  inGameId?: number;
  catPoints: number;
}

export interface Player extends User {
  highestWpm: number;
  lastTenAverageWpm: number;
  gamesPlayed: number;
}
