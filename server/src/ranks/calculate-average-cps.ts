import { User } from '@prisma/client';

export const calculateAverageCPs = (catPoints: number[]) => {
  const sumCPs = catPoints.reduce((sum, point) => sum + point, 0);
  return +(sumCPs / catPoints.length).toFixed(0);
};
