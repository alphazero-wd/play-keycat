export interface Rank {
  minCPs: number;
  minWpm: number;
  maxCPsPenalty: number;
}

export const ranks: Record<string, Rank> = {
  Unranked: { minCPs: 0, minWpm: 20, maxCPsPenalty: 0 },
  'Bronze IV': { minCPs: 500, minWpm: 40, maxCPsPenalty: -1 },
  'Bronze III': { minCPs: 625, minWpm: 45, maxCPsPenalty: -2 },
  'Bronze II': { minCPs: 750, minWpm: 50, maxCPsPenalty: -3 },
  'Bronze I': { minCPs: 875, minWpm: 55, maxCPsPenalty: -4 },
  'Silver IV': { minCPs: 1000, minWpm: 60, maxCPsPenalty: -5 },
  'Silver III': { minCPs: 1125, minWpm: 65, maxCPsPenalty: -6 },
  'Silver II': { minCPs: 1250, minWpm: 70, maxCPsPenalty: -7 },
  'Silver I': { minCPs: 1375, minWpm: 75, maxCPsPenalty: -8 },
  'Gold IV': { minCPs: 1500, minWpm: 80, maxCPsPenalty: -9 },
  'Gold III': { minCPs: 1625, minWpm: 85, maxCPsPenalty: -10 },
  'Gold II': { minCPs: 1750, minWpm: 90, maxCPsPenalty: -11 },
  'Gold I': { minCPs: 1875, minWpm: 95, maxCPsPenalty: -12 },
  'Diamond IV': { minCPs: 2000, minWpm: 100, maxCPsPenalty: -13 },
  'Diamond III': { minCPs: 2125, minWpm: 105, maxCPsPenalty: -14 },
  'Diamond II': { minCPs: 2250, minWpm: 110, maxCPsPenalty: -15 },
  'Diamond I': { minCPs: 2375, minWpm: 115, maxCPsPenalty: -16 },
  'Emerald V': { minCPs: 2500, minWpm: 120, maxCPsPenalty: -17 },
  'Emerald IV': { minCPs: 2750, minWpm: 125, maxCPsPenalty: -18 },
  'Emerald III': { minCPs: 3000, minWpm: 130, maxCPsPenalty: -19 },
  'Emerald II': { minCPs: 3250, minWpm: 140, maxCPsPenalty: -20 },
  'Emerald I': { minCPs: 3500, minWpm: 150, maxCPsPenalty: -21 },
  Rainbow: { minCPs: 4000, minWpm: 160, maxCPsPenalty: -22 },
};
