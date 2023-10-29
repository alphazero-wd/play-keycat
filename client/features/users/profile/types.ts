export interface User {
  id: number;
  username: string;
  joinedAt: string;
  inGameId?: number;
  catPoints: number;
  highestWpm: number;
  lastTenAverageWpm: number;
  gamesPlayed: number;
}
