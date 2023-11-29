const BASE_XPS = 100;
const LEVEL_FACTOR = 1.1;

export const determineXPsRequired = (currentLevel: number) => {
  return Math.min(
    Math.round(BASE_XPS * Math.pow(LEVEL_FACTOR, currentLevel - 1)),
    (2 << 14) - 1,
  );
};
