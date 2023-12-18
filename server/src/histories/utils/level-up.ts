import { User } from '@prisma/client';
import { determineXPsRequired } from '../../xps';

export const levelUp = (user: User, xpsBonus: number) => {
  let newLevel = user.currentLevel;
  let xpsGained = user.xpsGained;
  while (xpsBonus >= determineXPsRequired(newLevel) - user.xpsGained) {
    xpsBonus -= determineXPsRequired(newLevel) - user.xpsGained;
    xpsGained = 0;
    newLevel++;
  }
  const hasLevelUp = user.currentLevel < newLevel;
  return {
    newLevel,
    newXPsRequired: determineXPsRequired(newLevel),
    newXPsGained: hasLevelUp ? xpsBonus : xpsGained + xpsBonus,
    hasLevelUp,
  };
};
