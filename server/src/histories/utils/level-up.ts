import { User } from '@prisma/client';
import { determineXPsRequired } from '../../users/utils';

export const levelUp = (user: User, xpsBonus: number) => {
  // user.xpsGained = 90, xpsBonus = 200
  // -10 -> Lvl 2: -110 -> -50
  // newLevel = 1
  // newXPsGained = 290
  // determine(2) = 110
  // (290 - 100 >= 0)
  //  newXPsGained = 290 - 100 = 190
  //  newLevel = 2
  // (190 - 110 >= 0)
  //  newLevel = 3
  //  newXPsGained = 80
  // (80 - 120 <= 0) stop
  // return newXPsGained = 80; newLevel = 3
  let newLevel = user.currentLevel;
  let newXPsGained = user.xpsGained + xpsBonus;
  while (newXPsGained - determineXPsRequired(newLevel) >= 0) {
    newXPsGained -= determineXPsRequired(newLevel);
    newLevel++;
  }
  return { newLevel, newXPsGained, hasLevelUp: user.currentLevel < newLevel };
};
