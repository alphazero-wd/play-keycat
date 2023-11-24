import { BASE_XPS, LEVEL_FACTOR } from '../../common/constants';

export const determineXPsRequired = (currentLevel: number) => {
  return Math.min(
    Math.round(BASE_XPS * Math.pow(LEVEL_FACTOR, currentLevel - 1)),
    (2 << 14) - 1,
  );
};
