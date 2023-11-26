import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User {
  id: number;

  username: string;

  @Exclude()
  email: string;

  @Exclude()
  password: string;

  joinedAt: Date;
  updatedAt: Date;
  inGameId: number;
  catPoints: number;
  currentLevel: number;
  xpsGained: number;
  xpsRequired: number;
}
