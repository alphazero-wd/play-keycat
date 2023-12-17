import { User } from '@prisma/client';
import { RankUpdateStatus, getCurrentRank } from '../../ranks';

export function checkRankUpdate(user: User, catPoints: number) {
  const prevRank = getCurrentRank(user.catPoints);
  const currentRank = getCurrentRank(user.catPoints + catPoints);
  const rankUpdateStatus =
    catPoints < 0 ? RankUpdateStatus.DEMOTED : RankUpdateStatus.PROMOTED;
  return { prevRank, currentRank, rankUpdateStatus };
}
