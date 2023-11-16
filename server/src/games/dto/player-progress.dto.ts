import { IsInt, Max, Min } from 'class-validator';

export class PlayerProgressDto {
  @IsInt()
  @Min(1)
  gameId: number;

  @IsInt()
  @Min(1)
  @Max(100)
  progress: number;

  @IsInt()
  @Min(0)
  wpm: number;
}
