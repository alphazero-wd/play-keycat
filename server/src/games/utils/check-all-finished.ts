export const checkAllFinished = (
  leftPlayersCount: number,
  maxPlayersCount: number,
  playersFinished: number,
) => {
  return playersFinished === maxPlayersCount - leftPlayersCount;
};
