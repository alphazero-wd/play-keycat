export interface Rank {
  minCPs: number;
  minWpm: number;
  minAcc: number;
}

export const ranks: Record<string, Rank> = {
  Unranked: { minCPs: 0, minWpm: 0, minAcc: 50 },
  "Bronze IV": { minCPs: 500, minWpm: 40, minAcc: 55 },
  "Bronze III": { minCPs: 625, minWpm: 45, minAcc: 60 },
  "Bronze II": { minCPs: 750, minWpm: 50, minAcc: 65 },
  "Bronze I": { minCPs: 875, minWpm: 55, minAcc: 70 },
  "Silver IV": { minCPs: 1000, minWpm: 60, minAcc: 75 },
  "Silver III": { minCPs: 1125, minWpm: 65, minAcc: 80 },
  "Silver II": { minCPs: 1250, minWpm: 70, minAcc: 85 },
  "Silver I": { minCPs: 1375, minWpm: 75, minAcc: 90 },
  "Gold IV": { minCPs: 1500, minWpm: 80, minAcc: 90 },
  "Gold III": { minCPs: 1625, minWpm: 85, minAcc: 90 },
  "Gold II": { minCPs: 1750, minWpm: 90, minAcc: 92 },
  "Gold I": { minCPs: 1875, minWpm: 95, minAcc: 92 },
  "Diamond IV": { minCPs: 2000, minWpm: 100, minAcc: 92 },
  "Diamond III": { minCPs: 2125, minWpm: 105, minAcc: 95 },
  "Diamond II": { minCPs: 2250, minWpm: 110, minAcc: 95 },
  "Diamond I": { minCPs: 2375, minWpm: 115, minAcc: 95 },
  "Emerald V": { minCPs: 2500, minWpm: 120, minAcc: 97 },
  "Emerald IV": { minCPs: 2750, minWpm: 125, minAcc: 97 },
  "Emerald III": { minCPs: 3000, minWpm: 130, minAcc: 97 },
  "Emerald II": { minCPs: 3250, minWpm: 140, minAcc: 98 },
  "Emerald I": { minCPs: 3500, minWpm: 150, minAcc: 98 },
  Rainbow: { minCPs: 4000, minWpm: 160, minAcc: 99 },
};
