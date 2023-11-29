export const calculateAverageCPs = (players: { catPoints: number }[]) => {
  const sumCPs = players
    .map((p) => p.catPoints)
    .reduce((sum, point) => sum + point, 0);
  return +(sumCPs / players.length).toFixed(0);
};
