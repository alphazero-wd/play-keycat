export interface User {
  id: number;
  username: string;
  joinedAt: string;
  inGameId?: number;
  catPoints: number;
  highestWpm: number;
  rank: string;
  lastTenAverageWpm: number;
  gamesPlayed: number;
  currentLevel: number;
  xpsGained: number;
  xpsRequired: number;
}
