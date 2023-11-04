import { User } from "@/features/users/profile";

export const calculateAverageCPs = (players: User[]) => {
  const sumCPs = players.reduce((sum, player) => sum + player.catPoints, 0);
  return +(sumCPs / players.length).toFixed(0);
};
