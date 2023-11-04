export const determinePosition = (
  playersProgress: Map<number, number>,
  playerId: number,
) => {
  // Input: {1: 50, 2: 75, 3: 60, 4: 75, 5: 100}, playerId = 3
  // Set + Sorted DESC: [100, 75, 60, 50]
  // Output: 3

  const progress = playersProgress.values();
  const sortedProgressSetDesc = Array.from(new Set(progress)).sort(
    (a, b) => b - a,
  );

  return (
    sortedProgressSetDesc.findIndex(
      (prog) => playersProgress.get(playerId) === prog,
    ) + 1
  );
};
