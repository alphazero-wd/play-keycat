export interface Rank {
  minCPs: number;
  minWpm: number;
  minAcc: number;
}

export const ranks: Record<string, Rank> = {
  Unranked: { minCPs: 0, minWpm: 20, minAcc: 95 },
  "Bronze IV": { minCPs: 500, minWpm: 40, minAcc: 95 },
  "Bronze III": { minCPs: 625, minWpm: 45, minAcc: 95 },
  "Bronze II": { minCPs: 750, minWpm: 50, minAcc: 95 },
  "Bronze I": { minCPs: 875, minWpm: 55, minAcc: 95 },
  "Silver IV": { minCPs: 1000, minWpm: 60, minAcc: 96 },
  "Silver III": { minCPs: 1125, minWpm: 65, minAcc: 96 },
  "Silver II": { minCPs: 1250, minWpm: 70, minAcc: 96 },
  "Silver I": { minCPs: 1375, minWpm: 75, minAcc: 96 },
  "Gold IV": { minCPs: 1500, minWpm: 80, minAcc: 97 },
  "Gold III": { minCPs: 1625, minWpm: 85, minAcc: 97 },
  "Gold II": { minCPs: 1750, minWpm: 90, minAcc: 97 },
  "Gold I": { minCPs: 1875, minWpm: 95, minAcc: 97 },
  "Diamond IV": { minCPs: 2000, minWpm: 100, minAcc: 98 },
  "Diamond III": { minCPs: 2125, minWpm: 105, minAcc: 98 },
  "Diamond II": { minCPs: 2250, minWpm: 110, minAcc: 98 },
  "Diamond I": { minCPs: 2375, minWpm: 115, minAcc: 98 },
  "Emerald V": { minCPs: 2500, minWpm: 120, minAcc: 98 },
  "Emerald IV": { minCPs: 2750, minWpm: 125, minAcc: 98 },
  "Emerald III": { minCPs: 3000, minWpm: 130, minAcc: 99 },
  "Emerald II": { minCPs: 3250, minWpm: 140, minAcc: 99 },
  "Emerald I": { minCPs: 3500, minWpm: 150, minAcc: 99 },
  Rainbow: { minCPs: 4000, minWpm: 160, minAcc: 99 },
};
