export const determineRank = (
  playersProgress: Record<number, number>,
  playerId: number
) => {
  // Input: {1: 50, 2: 75, 3: 60, 4: 75, 5: 100}, playerId = 3
  // Set + Sorted DESC: [100, 75, 60, 50]
  // Output: 3

  const progress = Object.values(playersProgress);
  const sortedProgressSetDesc = progress.sort((a, b) => b - a);

  return (
    sortedProgressSetDesc.findIndex(
      (prog) => playersProgress[playerId] === prog
    ) + 1
  );
};
