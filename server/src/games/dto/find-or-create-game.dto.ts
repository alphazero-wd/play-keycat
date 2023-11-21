import { GameMode } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class FindOrCreateGameDto {
  @IsEnum(GameMode)
  gameMode: GameMode;
}
