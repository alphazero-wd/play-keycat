export interface User {
  id: string;
  username: string;
  joinedAt: string;
  inGameId?: number;
  catPoints: number;
  currentLevel: number;
  xpsGained: number;
  xpsRequired: number;
  rank: string;
}

export interface Profile extends User {
  gamesPlayed: number;
  highestWpm: number;
  lastTenAverageWpm: number;
}
