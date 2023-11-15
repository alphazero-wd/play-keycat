import { IsInt, Max, Min } from 'class-validator';
import { MAX_PLAYERS_COUNT } from '../../common/constants';

export class PlayerProgressDto {
  @IsInt()
  @Min(1)
  gameId: number;

  @IsInt()
  @Min(1)
  @Max(MAX_PLAYERS_COUNT)
  pos: number;

  @IsInt()
  @Min(1)
  @Max(100)
  progress: number;

  @IsInt()
  @Min(0)
  wpm: number;
}
